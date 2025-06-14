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
                    Description = $"{referenceMonthDate:MMMM}Tuition Fee",
                    ReferenceMonthDate = referenceMonthDate,
                    DueDate = dueDate,
                    Status = GetStatus(dueDate, monthlyTuitionCreateDto.PaymentId!),
                    TrainerName = userName!,
                    StudentId = monthlyTuitionCreateDto.StudentId,
                    CourseInfoId = courseId!,
                    PaymentId = monthlyTuitionCreateDto.PaymentId!,
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
            return await _dbContext.StudentMonthlyTuition
                .AsNoTracking()
                .Select(sm => new StudentMonthlyTuitionModel
                {
                    Order = sm.Order,
                    Id = sm.Id,
                    Description = sm.Description,
                    ReferenceMonthDate = sm.ReferenceMonthDate,
                    DueDate = sm.DueDate,
                    Status = sm.Status,
                    TrainerName = sm.TrainerName,
                    DateRegister = sm.DateRegister,
                    DateUpdate = sm.DateUpdate,
                    StudentId = sm.StudentId,
                    //StudentData = sm.StudentData,
                    CourseInfoId = sm.CourseInfoId,
                    CourseInfoData = sm.CourseInfoData,
                    PaymentId = sm.PaymentId,
                    PaymentData = sm.PaymentData
                })
                .OrderByDescending(s => s.Order)
                .ToListAsync();
        }

        public async Task<ResponseDto> Update(StudentMonthlyTuitionUpdateDto monthlyTuitionUpdateDto)
        {
            try
            {
                var userPrincipal = _httpContextAccessor.HttpContext?.User;
                if (userPrincipal is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }

                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier);
                if (userId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userIdValue = userId.Value;
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userIdValue);
                if (user is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var usernameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var trainerName = usernameClaim?.Value;

                if (string.IsNullOrEmpty(monthlyTuitionUpdateDto.PaymentId))
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Payment id not found."
                    };
                }

                var paymentExists = await _dbContext.StudentPayments.AnyAsync(p => p.Id == monthlyTuitionUpdateDto.PaymentId);
                if (!paymentExists)
                {
                    return new ResponseDto { IsSuccess = false, Message = "Payment id  not found." };
                }

                var monthlyId = await _dbContext.StudentMonthlyTuition.FindAsync(monthlyTuitionUpdateDto.Order);
                if (monthlyId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Monthly tuition id not found."
                    };
                }

                monthlyId.PaymentId = monthlyTuitionUpdateDto.PaymentId;
                monthlyId.Status = GetStatusUpdate(monthlyTuitionUpdateDto.PaymentId);
                monthlyId.TrainerName = trainerName!;
                monthlyId.DateUpdate = DateTime.Now;

                //_dbContext.StudentMonthlyTuition.Update(monthlyId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Monthly tuition updated successfuly."
                };
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error while updating monthly tuition.");
                return new ResponseDto { IsSuccess = false, Message = "Database error occurred." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update monthly tuition.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to update monthly tuition."
                };
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

                return $"{year}{month}{nextOrder}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Payment ID.");
                throw new InvalidOperationException("Failed to generate Payment ID.");
            }
        }

        private static string GetStatus(DateTime dueDate, string paymentId)
        {
            int currentDay = DateTime.Now.Day;
            if (string.IsNullOrEmpty(paymentId) && (dueDate.Day >= currentDay))
            { return "Not Paid"; }
            else if (string.IsNullOrEmpty(paymentId) && (dueDate.Day < currentDay))
            { return "Overdue"; }
            else if (!string.IsNullOrEmpty(paymentId))
            { return "Paid"; }
            else
            { return "Error"; }
        }
        
        private static string GetStatusUpdate(string paymentId)
        {
            if (!string.IsNullOrEmpty(paymentId))
            { return "Paid"; }
            else
            { return "Error"; }
        }
    }
}