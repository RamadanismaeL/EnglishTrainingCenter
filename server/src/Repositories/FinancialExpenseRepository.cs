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
                    Status =  "Approved",                    
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
                    Message = "Approved and saved..."
                };
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error creating course");
                return new ResponseDto { IsSuccess = false, Message = "Database operation failed." };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "System error creating course");
                return new ResponseDto { IsSuccess = false, Message = "System error processing request." };
            }
        }

        public Task<ResponseDto> Update(FinancialExpenseModel financialExpense)
        {
            throw new NotImplementedException();
        }

        public Task<ResponseDto> CancelStatus(long order)
        {
            throw new NotImplementedException();
        }
    }
}