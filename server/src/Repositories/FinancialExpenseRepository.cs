/*
* Copyright 2025 | Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Routing.Constraints;
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
                    Status = "Paid",
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
                    Message = "Paid and saved."
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

        public async Task<ResponseDto> UpdateStatus(long id, string status)
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

                // Check if already cancelled → Do not allow further updates
                if (findExpenseId.Status == "Cancelled")
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cannot update a cancelled expense."
                    };
                }

                findExpenseId.LastUpdate = DateTime.Now;
                findExpenseId.Status = status;
                findExpenseId.TrainerName = trainerName!;

                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Payment confirmed"
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

        public async Task<List<FinancialExpenseListDto>> GetListAllData()
        {
            var expenseList = await _dbContext.FinancialExpense
                .AsNoTracking()
                .Where(e => e.Status == "Paid" || e.Status == "Cancelled")
                .ToListAsync();
            return [.. expenseList.Select(s => new FinancialExpenseListDto
            {
                Id = s.Id,
                Description = s.Description,
                Method = s.Method,
                AmountMT = s.AmountMT,
                LastUpdate = s.LastUpdate,
                Status = s.Status,
                TrainerName = s.TrainerName
            }).OrderByDescending(x => x.LastUpdate)];
        }

        public async Task<ResponseDto> CreatePending(FinancialExpenseCreatePendingDto financialExpenseCreatePendingDto)
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
                    Description = financialExpenseCreatePendingDto.Description,
                    Method = "--",
                    AmountMT = financialExpenseCreatePendingDto.AmountMT,
                    LastUpdate = DateTime.Now,
                    Status = "Pending",
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
                    Message = "Pending and saved."
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

        public async Task<List<FinancialExpenseListPendingDto>> GetListPending()
        {
            var expenseList = await _dbContext.FinancialExpense
                .AsNoTracking()
                .Where(e => e.Status == "Pending")
                .ToListAsync();
            return [.. expenseList.Select(s => new FinancialExpenseListPendingDto
            {
                Id = s.Id,
                Description = s.Description,
                AmountMT = s.AmountMT,
                LastUpdate = s.LastUpdate,
                Status = s.Status,
                TrainerName = s.TrainerName
            }).OrderBy(x => x.Description)];
        }

        public async Task<ResponseDto> Delete(long id)
        {
            try
            {
                var existId = await _dbContext.FinancialExpense.FindAsync(id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                _dbContext.FinancialExpense.Remove(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting."
                };
            }
        }

        public async Task<ResponseDto> PayNow(long id, string method)
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

                // Check if already cancelled → Do not allow further updates
                if (findExpenseId.Status == "Cancelled")
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cannot update a cancelled expense."
                    };
                }

                findExpenseId.LastUpdate = DateTime.Now;
                findExpenseId.Method = method;
                findExpenseId.Status = "Paid";
                findExpenseId.TrainerName = trainerName!;

                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Payment confirmed"
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

        public async Task<List<FinancialExpenseListDto>> GetListDailyReport()
        {
            var expenseList = await _dbContext.FinancialExpense
                .AsNoTracking()
                .Where
                (e =>
                    (e.Status == "Paid" || e.Status == "Cancelled") &&
                    e.LastUpdate.Date == DateTime.Today
                )
                .ToListAsync();
            return [.. expenseList.Select(s => new FinancialExpenseListDto
            {
                Id = s.Id,
                Description = s.Description,
                Method = s.Method,
                AmountMT = s.AmountMT,
                LastUpdate = s.LastUpdate,
                Status = s.Status,
                TrainerName = s.TrainerName
            }).OrderByDescending(x => x.LastUpdate)];
        }
    }
}