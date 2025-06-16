/*
* Copyright 2025 - @author: Ramadan Ismael
*/

using EFCore.BulkExtensions;
using Microsoft.EntityFrameworkCore;
using Quartz;
using server.src.Data;
using server.src.Models;

namespace server.src.Repositories
{
    public class MonthlyTuitionJob
    (ILogger<MonthlyTuitionJob> logger,
    ServerDbContext dbContext)
    : IJob
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<MonthlyTuitionJob> _logger = logger;

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("MonthlyTuitionJob started at {Time}", DateTime.Now);
            
            try
            {
                var now = DateTime.Now;
                var referenceMonthDate = new DateTime(now.Year, now.Month, 1);
                var dueDate = new DateTime(now.Year, now.Month, 10);

                var students = await _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Active")
                    .Select(s => new
                    {
                        s.Id,
                        Course = s.CourseInfo!
                            .FirstOrDefault(c => c.Status == "In Progress" && c.CurrentLevel)
                    })
                    .Where(x => x.Course != null)
                    .ToListAsync();

                if (students.Count == 0)
                {
                    _logger.LogInformation("No active students found for monthly tuition.");
                    return;
                }
                _logger.LogInformation("Found {Count} active students for monthly tuition.", students.Count);

                foreach (var student in students)
                {
                    var existing = await _dbContext.StudentMonthlyTuition
                        .AnyAsync(m => m.StudentId == student.Id && m.ReferenceMonthDate == referenceMonthDate);

                    if (existing) continue;

                    var newId = GenerateMonthlyId();
                    if (newId is null) continue;

                    var receipt = new StudentMonthlyTuitionModel
                    {
                        Id = newId,
                        Description = $"{referenceMonthDate:MMMM} Tuition Fee",
                        ReferenceMonthDate = referenceMonthDate,
                        DueDate = dueDate,
                        Status = "Pending",
                        TrainerName = "ETC Team",
                        StudentId = student.Id,
                        CourseInfoId = student.Course!.Id,
                        PaymentId = null,
                    };

                    await _dbContext.StudentMonthlyTuition.AddAsync(receipt);
                    await _dbContext.SaveChangesAsync();
                }

                _logger.LogInformation("Monthly tuition created successfully at {Time} : ", DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in MonthlyTuitionJob at {Time}", DateTime.Now);
                throw;
            }
        }
        
        private string GenerateMonthlyId()
        {
            try
            {
                long lastOrder = _dbContext.StudentMonthlyTuition
                    .OrderByDescending(p => p.Order)
                    .Select(p => p.Order)
                    .FirstOrDefault();

                long nextOrder = lastOrder + 1;
                int year = DateTime.Now.Year;
                int month = DateTime.Now.Month;

                string newID = $"{year}{month:D2}-{nextOrder}";

                return newID;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Payment ID.");
                throw new InvalidOperationException("Failed to generate Payment ID.");
            }
        }
    }
}