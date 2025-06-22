/*
* Copyright 2025 | Ramadan Ismael
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
    public class FinancialExpenseRepository(ServerDbContext dbContext, ILogger<FinancialExpenseRepository> logger, IHttpContextAccessor httpContextAccessor) : IFinancialExpenseRepository
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<FinancialExpenseRepository> _logger = logger;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task<ResponseDto> Create(FinancialExpenseCreateDto financialExpenseCreateDto)
        {
            var userPrincipal = _httpContextAccessor.HttpContext?.User;
            if (userPrincipal?.FindFirst(ClaimTypes.NameIdentifier) is not Claim userId)
            {
                return new ResponseDto { IsSuccess = false, Message = "User not authenticated." };
            }

            // 2. Database Context Setup
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // 3. User Validation
                var user = await _dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);

                if (user is null)
                {
                    return new ResponseDto { IsSuccess = false, Message = "User not found." };
                }

                var trainerName = userPrincipal.FindFirst(JwtRegisteredClaimNames.Name)?.Value
                    ?? "System Generated";

                var expenseData = new FinancialExpenseModel
                {
                    Description = financialExpenseCreateDto.Description,
                    Method = financialExpenseCreateDto.Method,
                    AmountMT = financialExpenseCreateDto.AmountMT,
                    LastUpdate = DateTime.Now,
                    Status = "Approved",
                    TrainerName = trainerName
                };

                // 7. Atomic Operations
                await _dbContext.FinancialExpense.AddAsync(expenseData);
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                /* 8. Audit Trail (Recommended)
                _logger.LogInformation("Course {CourseId} created for student {StudentId}", 
                    newID, studentCourseCreateDto.StudentId);
                    */

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Approved and saved."
                };
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error creating expense");
                return new ResponseDto { IsSuccess = false, Message = "Database operation failed." };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "System error creating expense");
                return new ResponseDto { IsSuccess = false, Message = "System error processing request." };
            }
        }

        public async Task<ResponseDto> Update(FinancialExpenseUpdateDto financialExpenseUpdateDto)
        {
            var userPrincipal = _httpContextAccessor.HttpContext?.User;
            if (userPrincipal?.FindFirst(ClaimTypes.NameIdentifier) is not Claim userId)
            {
                return new ResponseDto { IsSuccess = false, Message = "User not authenticated." };
            }

            // 2. Database Context Setup
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // 3. User Validation
                var user = await _dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);

                if (user is null)
                {
                    return new ResponseDto { IsSuccess = false, Message = "User not found." };
                }

                var trainerName = userPrincipal.FindFirst(JwtRegisteredClaimNames.Name)?.Value
                    ?? "System Generated";

                var findExpenseId = await _dbContext.FinancialExpense.FindAsync(financialExpenseUpdateDto.Id);
                if (findExpenseId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Expense ID not found."
                    };
                }

                findExpenseId.Description = financialExpenseUpdateDto.Description;
                findExpenseId.Method = financialExpenseUpdateDto.Method;
                findExpenseId.AmountMT = financialExpenseUpdateDto.AmountMT;
                findExpenseId.LastUpdate = DateTime.Now;
                findExpenseId.Status = "Approved";
                findExpenseId.TrainerName = trainerName;

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Approved and updated."
                };
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error updating expense");
                return new ResponseDto { IsSuccess = false, Message = "Database operation failed." };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "System error updating expense");
                return new ResponseDto { IsSuccess = false, Message = "System error processing request." };
            }
        }

        public async Task<ResponseDto> CancelStatus(long id)
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

                var findExpenseId = await _dbContext.FinancialExpense.FindAsync(id);
                if (findExpenseId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Expense ID not found."
                    };
                }

                findExpenseId.LastUpdate = DateTime.Now;
                findExpenseId.Status = "Cancelled";
                findExpenseId.TrainerName = trainerName!;

                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Cancelled successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed."
                };
            }
        }

        public async Task<List<FinancialExpenseModel>> GetListAllData()
        {
            return await _dbContext.FinancialExpense.AsNoTracking().ToListAsync();
        }
    }
}