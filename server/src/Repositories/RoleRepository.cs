/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<TrainerModel> _userManager;
        private readonly ILogger<RoleRepository> _logger;

        public RoleRepository(RoleManager<IdentityRole> roleManager, UserManager<TrainerModel> userManager, ILogger<RoleRepository> logger)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<ResponseDto> Create(RoleCreateDto roleCreateDto)
        {
            var roleExist = await _roleManager.RoleExistsAsync(roleCreateDto.RoleName);

            if(roleExist)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Role is already existe."
                };
            }

            try
            {
                var result = await _roleManager.CreateAsync(new IdentityRole(roleCreateDto.RoleName));

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to create role : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Role created successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error creating role.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating the role."
                };
            }
        }

        public async Task<IEnumerable<RoleDetailDto>> Details()
        {
            var roles = await _roleManager.Roles.ToListAsync(); // Busca todas as roles primeiro
            var roleUserCounts = new Dictionary<string, int>();

            // Obtém o número de usuários por role de forma eficiente
            foreach (var role in roles)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
                roleUserCounts[role.Name!] = usersInRole.Count;
            }

            // Mapeia os dados para DTOs
            return [.. roles.Select(r => new RoleDetailDto
            {
                Id = r.Id,
                Name = r.Name,
                TotalUsers = roleUserCounts[r.Name!]
            }).OrderBy(r => r.Name)];
        }

        public async Task<ResponseDto> Update(RoleUpdateDto roleUpdateDto, string id)
        {
            var roleID = await _roleManager.FindByIdAsync(id.ToString());
            if(roleID == null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Role not found."
                };
            }

            var roleExist = await _roleManager.RoleExistsAsync(roleUpdateDto.RoleName);
            if(roleExist && roleID.Name != roleUpdateDto.RoleName)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Role already exists."
                };
            }

            try
            {
                roleID.Name = roleUpdateDto.RoleName;
                var result = await _roleManager.UpdateAsync(roleID);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to update role : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Role updated successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error updating role.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating the role."
                };
            }
        }

        public async Task<ResponseDto> Delete(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);

            if(role is null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Role not found."
                };
            }

            try
            {
                var result = await _roleManager.DeleteAsync(role);

                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(r => r.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to delete role : {errorMessage}"
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Role deleted successfully."
                };
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error deleting role.");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting the role."
                };
            }
        }
    
        public async Task<ResponseDto> Assign(RoleAssignDto roleAssignDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(roleAssignDto.UserId);

                if (user is null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Trainer not found."
                    };
                }

                var role = await _roleManager.FindByIdAsync(roleAssignDto.RoleId);

                if(role is null)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = "Role not found."
                    };
                }

                var result = await _userManager.AddToRoleAsync(user, role.Name!);

                if (!result.Succeeded)
                {
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to assign role. Please try again later."
                    };
                }

                return new ResponseDto {
                    IsSuccess = true,
                    Message = "Role assigned successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while assigning role");
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "An unexpected error occurred. Please try again later."
                };
            }
        }
    }
}