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

            var existingStudentIds = await _dbContext.StudentMonthlyTuition
                .Where(m => m.ReferenceMonthDate == referenceMonthDate)
                .Select(m => m.StudentId)
                .ToListAsync();

            var receipts = students
                .Where(s => !existingStudentIds.Contains(s.Id))
                .Select(s => new StudentMonthlyTuitionModel
                {
                    Id = GenerateMonthlyId(),
                    Description = $"{referenceMonthDate:MMMM} Tuition Fee",
                    ReferenceMonthDate = referenceMonthDate,
                    DueDate = dueDate,
                    Status = "Pending",
                    TrainerName = "ETC Team",
                    StudentId = s.Id,
                    CourseInfoId = s.Course!.Id,
                    PaymentId = null,
                })
                .ToList();

            await _dbContext.BulkInsertAsync(receipts); //dotnet add package EFCore.BulkExtensions
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

                return $"{year}{month}{nextOrder}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Payment ID.");
                throw new InvalidOperationException("Failed to generate Payment ID.");
            }
        }
    }
}