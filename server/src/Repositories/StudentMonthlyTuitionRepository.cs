/*
*@author Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.src.Data;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class StudentMonthlyTuitionRepository(ServerDbContext dbContext, ILogger<StudentMonthlyTuitionRepository> logger, IHttpContextAccessor httpContextAccessor) : IStudentMonthlyTuitionRepository
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<StudentMonthlyTuitionRepository> _logger = logger;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task<ResponseDto> Create(StudentMonthlyTuitionCreateDto monthlyTuitionCreateDto)
        {
            try
            {
                var userPrincipal = _httpContextAccessor.HttpContext?.User;
                if (userPrincipal == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }
                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userIdValue = userId.Value;
                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == userIdValue);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userNameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var userName = userNameClaim?.Value;

                var courseId = await _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Id == monthlyTuitionCreateDto.StudentId && s.Status == "Active")
                    .Select(s => s.CourseInfo!
                        .Where(c => c.Status == "In Progress")
                        .Select(c => c.Id)
                        .FirstOrDefault())
                    .FirstOrDefaultAsync();

                var newID = GenerateMonthlyId();
                if (newID is null) return null!;

                int currentYear = DateTime.Now.Year;
                int currentMonth = DateTime.Now.Month;
                var referenceMonthDate = new DateTime(currentYear, currentMonth, 1);
                var dueDate = new DateTime(currentYear, currentMonth, 10);

                var receiptData = new StudentMonthlyTuitionModel
                {
                    Id = newID,
                    Description = monthlyTuitionCreateDto.Description,
                    ReferenceMonthDate = referenceMonthDate,
                    DueDate = dueDate,
                    Status = GetStatus(dueDate),
                    TrainerName = userName!,
                    StudentId = monthlyTuitionCreateDto.StudentId,
                    CourseInfoId = courseId!,
                    PaymentId = null!,
                };

                await _dbContext.StudentMonthlyTuition.AddAsync(receiptData);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Monthly Tuition created successfuly."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create monthly tuition.");
                return new ResponseDto { IsSuccess = false, Message = "Failed to create monthly tuition." };
            }
        }

        public async Task<IEnumerable<StudentMonthlyTuitionModel>> GetAllMonthlyTuition()
        {
            var query = await _dbContext.StudentMonthlyTuition
                .AsNoTracking()
                .ToListAsync();

            return [.. query];
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

                return $"{month}{year}-{nextOrder}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Payment ID.");
                throw new InvalidOperationException("Failed to generate Payment ID.");
            }
        }

        private static string GetStatus(DateTime dueDate)
        {
            int currentDay = DateTime.Now.Day;
            if (dueDate.Day >= currentDay)
            { return "Not Paid"; }
            else if (dueDate.Day < currentDay)
            { return "Overdue"; }
            else
            { return "Error"; }
        }
    }
}