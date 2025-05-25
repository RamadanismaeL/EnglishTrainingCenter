/*
*@author Ramadan Ismael
*/

using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server.src.Configs;
using server.src.Data;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;
using server.src.Services;

namespace server.src.Repositories
{
    public class TrainerRepository : ITrainerRepository
    {
        private readonly UserManager<TrainerModel> _trainerManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<TrainerRepository> _logger;
        private readonly ServerDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public TrainerRepository(UserManager<TrainerModel> userManager, RoleManager<IdentityRole> roleManager, IHttpContextAccessor httpContextAccessor, ILogger<TrainerRepository> logger, ServerDbContext dbContext, IConfiguration configuration)
        {
            _trainerManager = userManager;
            _roleManager = roleManager;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _dbContext = dbContext;
            _configuration = configuration;    
        }

        public async Task<ResponseDto> Create(TrainerCreateDto trainerCreateDto)
        {
            // Verificar se o Trainer já existe
            var emailExist = await _trainerManager.FindByEmailAsync(trainerCreateDto.Email);
            var userNameExist = await _trainerManager.FindByNameAsync(trainerCreateDto.FullName);

            if((emailExist is not null) || (userNameExist is not null))
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Trainer is alreadt exist."
                };
            }

            /* Validação da imagem de Perfil
            if(trainerCreateDto.ProfileImage is null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Profile Image  is request."
                };
            }
            */

            try
            {
                var pictureUrl = string.Empty;
                // Upload da imagem de perfil
                if(trainerCreateDto.ProfileImage is not null)
                {
                    var picture = await FileUploadConfig.UploadFile(trainerCreateDto.ProfileImage!);
                    var httpContext = _httpContextAccessor.HttpContext;
                    pictureUrl = $"{httpContext!.Request.Scheme}://{httpContext.Request.Host}/uploads/{picture}";
                }
                

                // Criação do Trainer
                var trainer = new TrainerModel {
                    FullName = trainerCreateDto.FullName,
                    Email = trainerCreateDto.Email,
                    PhoneNumber = trainerCreateDto.PhoneNumber,
                    Position = trainerCreateDto.Position,
                    Status = trainerCreateDto.Status,
                    UserName = trainerCreateDto.Email,
                    ProfileImage = pictureUrl
                };

                // Cria 0 Usuário no Identity 
                var result = await _trainerManager.CreateAsync(trainer, trainerCreateDto.Password);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(t => t.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to create trainer : {errorMessage}"
                    };
                }

                //Adiciona Roles ao trainer
                if(trainerCreateDto.Roles is null || !trainerCreateDto.Roles.Any())
                {
                    await _trainerManager.AddToRoleAsync(trainer, "User"); // Role Padrão := 'User'
                }
                else
                {
                    foreach(var role in trainerCreateDto.Roles)
                    {
                        await _trainerManager.AddToRoleAsync(trainer, role);
                    }
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Trainer created successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error creating trainer.");
                return new ResponseDto{
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating the trainer."
                };
            }
        }

        public async Task<IEnumerable<TrainerDetailsDto>> Details()
        {
            var trainers = await _trainerManager.Users.AsNoTracking().ToListAsync();

            return [.. trainers.Select(t => new TrainerDetailsDto{
                ProfileImage = t.ProfileImage,
                Id = t.Id,
                FullName = t.FullName,
                Email = t.Email,
                PhoneNumber = t.PhoneNumber,
                Position = t.Position,
                Status = t.Status,
                Roles = [.. _trainerManager.GetRolesAsync(t).Result],
                DateRegister = t.DateRegister
            }).OrderBy(t => t.FullName)];
        }

        public async Task<int> AnyDetails()
        {
            return await _trainerManager.Users.CountAsync();
        }

        public async Task<IEnumerable<TrainerDetailsSubsidyDto>> DetailsSubsidy()
        {
            var trainers = await _trainerManager.Users.ToListAsync();

            return [
                .. trainers.Select(t => new TrainerDetailsSubsidyDto {
                    ProfileImage = t.ProfileImage,
                    Id = t.Id,
                    FullName = t.FullName,
                    Position = t.Position,
                    Status = t.Status,
                    SubsidyMT = t.SubsidyMT,
                    DateUpdate = t.DateUpdate
                }).OrderBy(t => t.FullName)
            ];
        }

        public async Task<ResponseDto> Update(TrainerUpdateDto trainerUpdateDto)
        {
            try
            {
                var trainer = await _trainerManager.FindByIdAsync(trainerUpdateDto.Id.ToString());
                if (trainer == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Trainer not found."
                    };
                }

                // Verificações de nome e email existentes
                var trainerByFullName = await _trainerManager.Users
                    .FirstOrDefaultAsync(t => t.FullName == trainerUpdateDto.FullName && t.Id != trainerUpdateDto.Id);
                if (trainerByFullName != null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Full name already exists."
                    };
                }

                var trainerByEmail = await _trainerManager.FindByEmailAsync(trainerUpdateDto.Email);
                if (trainerByEmail != null && trainerByEmail.Id != trainerUpdateDto.Id)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Email already exists."
                    };
                }

                // Tratamento da imagem de perfil
                if (trainerUpdateDto.ProfileImage is not null)
                {
                    // Remove a imagem existente se houver
                    if (!string.IsNullOrEmpty(trainer.ProfileImage))
                    {
                        var oldImageName = Path.GetFileName(new Uri(trainer.ProfileImage).LocalPath);
                        var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads", oldImageName);

                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                        //trainer.ProfileImage = null; // Remove a referência da imagem
                    }  

                    // Faz upload da nova imagem
                    var picture = await FileUploadConfig.UploadFile(trainerUpdateDto.ProfileImage!);
                    var httpContext = _httpContextAccessor.HttpContext;
                    trainer.ProfileImage = $"{httpContext!.Request.Scheme}://{httpContext.Request.Host}/uploads/{picture}";                  
                }

                // Atualiza as propriedades do treinador
                trainer.FullName = trainerUpdateDto.FullName;
                trainer.Email = trainerUpdateDto.Email;
                trainer.PhoneNumber = trainerUpdateDto.PhoneNumber;
                trainer.Position = trainerUpdateDto.Position;
                trainer.Status = trainerUpdateDto.Status;

                // Atualiza o treinador
                var result = await _trainerManager.UpdateAsync(trainer);
                if (!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description));
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to update trainer: {errorMessage}"
                    };
                }

                // Atualização de roles
                if (trainerUpdateDto.Roles != null)
                {
                    var currentRoles = await _trainerManager.GetRolesAsync(trainer);
                    var removeResult = await _trainerManager.RemoveFromRolesAsync(trainer, currentRoles);

                    if (!removeResult.Succeeded)
                    {
                        _logger.LogWarning($"Failed to remove roles: { string.Join(", ", removeResult.Errors.Select(e => e.Description)) }");
                    }

                    foreach (var role in trainerUpdateDto.Roles)
                    {
                        if (!await _roleManager.RoleExistsAsync(role))
                        {
                            await _roleManager.CreateAsync(new IdentityRole(role));
                        }
                    }

                    var addResult = await _trainerManager.AddToRolesAsync(trainer, trainerUpdateDto.Roles);

                    if (!addResult.Succeeded)
                    {
                        _logger.LogWarning($"Failed to add roles: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
                    }
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Trainer updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating trainer.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating the trainer."
                };
            }
        }

        public async Task<ResponseDto> UpdateSubsidy(TrainerUpdateSubsidyDto trainerUpdateSubsidyDto)
        {
            try
            {
                var trainer = await _trainerManager.FindByIdAsync(trainerUpdateSubsidyDto.Id);
                if(trainer == null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Trainer not found."
                    };
                }

                if (trainerUpdateSubsidyDto.SubsidyMT < 0)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Subsidy amount cannot be negative."
                    };
                }

                trainer.SubsidyMT = trainerUpdateSubsidyDto.SubsidyMT;
                trainer.DateUpdate = DateTime.Now;

                var result = await _trainerManager.UpdateAsync(trainer);

                if (!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to update subsidy for trainer : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Subsidy updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating subsidy for trainer");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred. Please try again later."
                };
            }
        }

        public async Task<ResponseDto> UpdateProfileImage(ClaimsPrincipal userPrincipal, IFormFile file)
        {
            if(userPrincipal == null)
            {
                throw new UnauthorizedAccessException("Trainer not authenticated.");
            }

            var userId = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if(string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Trainer not authenticated.");
            }

            if(file is null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Profile photo is request."
                };
            }

            try
            {
                var trainer = await _trainerManager.FindByIdAsync(userId);
                if(trainer is null)
                {
                    throw new KeyNotFoundException("User not found.");
                }                

                if (!string.IsNullOrEmpty(trainer.ProfileImage))
                {
                    try 
                    {
                        var oldImageName = Path.GetFileName(new Uri(trainer.ProfileImage).LocalPath);
                        if (!string.IsNullOrEmpty(oldImageName))
                        {
                            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                            var oldImagePath = Path.Combine(uploadsFolder, oldImageName);

                            if (System.IO.File.Exists(oldImagePath))
                            {
                                System.IO.File.Delete(oldImagePath);
                            }
                        }
                    }
                    catch (Exception imageEx)
                    {
                        _logger.LogWarning(imageEx, "Failed to delete trainer profile image, proceeding with trainer deletion");
                        // Não falha a operação principal se a imagem não puder ser deletada
                    }
                }

                // Faz upload da nova imagem
                var picture = await FileUploadConfig.UploadFile(file);

                var httpContext = _httpContextAccessor.HttpContext;
                var pictureUrl = $"{httpContext!.Request.Scheme}://{httpContext.Request.Host}/uploads/{picture}";

                trainer.ProfileImage = pictureUrl;

                var result = await _trainerManager.UpdateAsync(trainer);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to update Profile photo : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Profile photo updated."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Profile photo.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating the Profile photo."
                };
            }
        }

        public async Task<ResponseDto> DeleteProfileImage(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Id is request."
                };
            }

            var trainer = await _trainerManager.FindByIdAsync(id);
            if (trainer is null)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Trainer not found."
                };
            }

            try
            {
                if (!string.IsNullOrEmpty(trainer.ProfileImage))
                {
                    try 
                    {
                        var oldImageName = Path.GetFileName(new Uri(trainer.ProfileImage).LocalPath);
                        if (!string.IsNullOrEmpty(oldImageName))
                        {
                            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                            var oldImagePath = Path.Combine(uploadsFolder, oldImageName);

                            if (System.IO.File.Exists(oldImagePath))
                            {
                                System.IO.File.Delete(oldImagePath);
                            }
                        }
                    }
                    catch (Exception imageEx)
                    {
                        _logger.LogWarning(imageEx, "Failed to delete trainer profile image, proceeding with trainer deletion");
                        // Não falha a operação principal se a imagem não puder ser deletada
                    }
                }

                trainer.ProfileImage = null;
                trainer.DateUpdate = DateTime.Now;

                var result = await _trainerManager.UpdateAsync(trainer);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to update Profile photo : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Profile photo deleted."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Profile photo.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting the Profile photo."
                };
            }
        }

        public async Task<ResponseDto> Delete(string id)
        {
            var trainer = await _trainerManager.FindByIdAsync(id);
            if(trainer is null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Trainer not found."
                };
            }

            try
            {
                if (!string.IsNullOrEmpty(trainer.ProfileImage))
                {
                    try 
                    {
                        var oldImageName = Path.GetFileName(new Uri(trainer.ProfileImage).LocalPath);
                        if (!string.IsNullOrEmpty(oldImageName))
                        {
                            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                            var oldImagePath = Path.Combine(uploadsFolder, oldImageName);

                            if (System.IO.File.Exists(oldImagePath))
                            {
                                System.IO.File.Delete(oldImagePath);
                            }
                        }
                    }
                    catch (Exception imageEx)
                    {
                        _logger.LogWarning(imageEx, "Failed to delete trainer profile image, proceeding with trainer deletion");
                        // Não falha a operação principal se a imagem não puder ser deletada
                    }
                }
                    
                var result = await _trainerManager.DeleteAsync(trainer);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(t => t.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to delete trainer : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Trainer deleted successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error deleting trainer.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting the trainer."
                };
            }
        }        

        public async Task<TrainerDetailsDto> Detail(ClaimsPrincipal userPrincipal)
        {
            if(userPrincipal == null)
            {
                throw new UnauthorizedAccessException("Trainer not authenticated.");
            }

            var userId = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if(string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Trainer not authenticated.");
            }

            try
            {
                var trainer = await _trainerManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User not found.");
                var roles = await _trainerManager.GetRolesAsync(trainer);

                return new TrainerDetailsDto
                {
                    ProfileImage = trainer.ProfileImage,
                    Id = trainer.Id,
                    FullName = trainer.FullName,
                    Email = trainer.Email,
                    PhoneNumber = trainer.PhoneNumber,
                    Position = trainer.Position,
                    Status = trainer.Status,
                    Roles = roles.ToArray(),
                    DateRegister = trainer.DateRegister
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while retrieving trainer detail.");
                throw; // Re-lança a exceção para ser tratada em um nível superior
            }
        }

        public async Task<ResponseDto> ValidateResetCode(ValidateResetCodeDto validateResetCodeDto)
        {
            var user = await _trainerManager.FindByEmailAsync(validateResetCodeDto.Email);
            if(user == null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Invalid email."
                };
            }

            var resetCode = await _dbContext.PasswordResetCode
                .Where(t => t.UserId == user.Id && t.Code == validateResetCodeDto.Code && t.ExpiresAt >= DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (resetCode == null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Invalid or expired code."
                };
            }

            _dbContext.PasswordResetCode.Remove(resetCode);
            await _dbContext.SaveChangesAsync();

            return new ResponseDto {
                IsSuccess = true,
                Message = "Code verified successfully."
            };
        }

        public async Task<ResponseDto> ForgotPassword(TrainerForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var user = await _trainerManager.FindByEmailAsync(forgotPasswordDto.Email);

                if(user == null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Email not found."
                    };
                }

                var random = new Random();
                var newCode = random.Next(100000, 999999).ToString();

                // salvar o codigo no bd
                var resetCode = new PasswordResetCodeModel
                {
                    UserId = user.Id,
                    Code = newCode,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };

                _dbContext.PasswordResetCode.Add(resetCode);
                await _dbContext.SaveChangesAsync();

                // Envia o e-mail com código
                //bool emailSent = EmailService.SendVerificationCodeEmail(_configuration, user.Email!, newCode);
                bool emailSent = GmailService.SendVerificationCodeEmail(_configuration, user.Email!, newCode);

                if(emailSent)
                {
                    return new ResponseDto {
                        IsSuccess = true,
                        Message = "Verification code sent to email.. Please check your email."
                    };
                }
                else
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Failed to send email."
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the forgot password request.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An error occurred while processing your request."
                };
            }
        }

        public async Task<ResponseDto> SendNewCode(TrainerSendNewCodeDto sendNewCodeDto)
        {
            try
            {
                var user = await _trainerManager.FindByEmailAsync(sendNewCodeDto.Email);

                if(user == null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Email not found."
                    };
                }

                var random = new Random();
                var newCode = random.Next(100000, 999999).ToString();

                // salvar o codigo no bd
                var resetCode = new PasswordResetCodeModel
                {
                    UserId = user.Id,
                    Code = newCode,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };

                _dbContext.PasswordResetCode.Add(resetCode);
                await _dbContext.SaveChangesAsync();

                // Envia o e-mail com código
                //bool emailSent = EmailService.SendVerificationCodeEmail(_configuration, user.Email!, newCode);
                bool emailSent = GmailChangePassService.SendVerificationCodeEmail(_configuration, sendNewCodeDto.Name, user.Email!, newCode);

                if(emailSent)
                {
                    return new ResponseDto {
                        IsSuccess = true,
                        Message = "Verification code sent to email.. Please check your email."
                    };
                }
                else
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Failed to send email."
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the send new code request.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An error occurred while processing your request."
                };
            }
        }

        public async Task<ResponseDto> ResetPassword(TrainerResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _trainerManager.FindByEmailAsync(resetPasswordDto.Email);
                //resetPasswordDto.Token = WebUtility.UrlDecode(resetPasswordDto.Token);

                if(user is null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Email not found."
                    };
                }

                var token = await _trainerManager.GeneratePasswordResetTokenAsync(user);

                var result = await _trainerManager.ResetPasswordAsync(user, token, resetPasswordDto.NewPassword);

                if(result.Succeeded)
                {
                    return new ResponseDto {
                        IsSuccess = true,
                        Message = "Password reset successfully."
                    };
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        //Message = result.Errors.FirstOrDefault()!.Description
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while resetting the password for email: {Email}", resetPasswordDto.Email);
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred. Please try again later."
                };
            }
        }

        public async Task<ResponseDto> ChangePassword(TrainerChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _trainerManager.FindByEmailAsync(changePasswordDto.Email!.Trim());
                
                if (user == null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Invalid email or password."
                    };
                }

                var result = await _trainerManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Failed to change the password. Please check your current password and try again."
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Password changed successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "An error occurred while changing the password.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = $"An unexpected error occurred while attempting to change the password."
                };
            }
        }
    }
}