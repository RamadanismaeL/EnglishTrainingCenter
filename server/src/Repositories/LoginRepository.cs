/*
*@author Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class LoginRepository : ILoginRepositoy
    {
        private readonly UserManager<TrainerModel> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<LoginRepository> _logger;

        public LoginRepository(
            UserManager<TrainerModel> userManager,
            ILogger<LoginRepository> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<ResponseDto> SignIn(LoginDto loginDto)
        {
            if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Email and password are required."
                };
            }

            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Incorrect email or password."
                    };
                }

                var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                if (!isPasswordValid)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Incorrect email or password."
                    };
                }

                var token = await GenerateToken(user);

                // RefreshToken
                var refreshToken = GenerateRefreshToken();

                if (!int.TryParse(_configuration["JWTSettings:expiryTime"], out int refreshTokenValidityIn)) throw new InvalidOperationException("Invalid refresh token validity configuration.");

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenValidityIn);
                
                var result = await _userManager.UpdateAsync(user);
                if(!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(t => t.Description).FirstOrDefault());
                    return new ResponseDto {
                        IsSuccess = false,
                        Message = $"Failed to update user : {errorMessage}"
                    }; 
                }
                // end

                return new ResponseDto
                {
                    Token = token,
                    IsSuccess = true,
                    Message = "Login successful.",
                    RefreshToken = refreshToken
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during sign-in.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred during sign-in."
                };
            }
        }

        private async Task<string> GenerateToken(TrainerModel trainerModel)
        {
            var jwtSettings = _configuration.GetSection("JWTSettings").Get<JwtSettingsDTOs>() 
                      ?? throw new InvalidOperationException("JWT settings are not properly configured.");

            if (string.IsNullOrWhiteSpace(jwtSettings.ValidAudience) || 
                string.IsNullOrWhiteSpace(jwtSettings.ValidIssuer) || 
                string.IsNullOrWhiteSpace(jwtSettings.SecurityKey))
            {
                throw new InvalidOperationException("JWT settings contain invalid values.");
            }

            var key = Encoding.UTF8.GetBytes(jwtSettings.SecurityKey);
            var signing = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(signing, SecurityAlgorithms.HmacSha256);

            // Obtém as roles do usuário
            var roles = await _userManager.GetRolesAsync(trainerModel);

            // Define as cliams do token
             var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, trainerModel.Id), // ID do usuário
                new Claim(JwtRegisteredClaimNames.Email, trainerModel.Email!),                
                new Claim(JwtRegisteredClaimNames.Name, trainerModel.FullName!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // ID único do token
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64) // Data de criação do token
            };

            // Adiciona todas as roles como claims
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            // Configuração do token
            var tokenDescriptor = new SecurityTokenDescriptor
            {                
                Subject = new ClaimsIdentity(claims),
                NotBefore = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings.ExpiryTime!)),
                SigningCredentials = credentials,
                Issuer = jwtSettings.ValidIssuer,
                Audience = jwtSettings.ValidAudience
            };

            // Gera e retorna o token
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    
        private string GenerateRefreshToken()
        {
            const int tokenSizeInBytes = 32; // Tamanho do token em bytes

            try
            {
                var randomNumber = new byte[tokenSizeInBytes];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomNumber);

                return Convert.ToBase64String(randomNumber);
            }
            catch (Exception ex)
            {
                // Log do erro
                _logger.LogError(ex, "Error generating refresh token.");
                throw new InvalidOperationException("Failed to generate refresh token.", ex);
            }
        }
    
        public async Task<ResponseDto> RefreshToken(TokenDto tokenDto)
        {
            // Extrai o principal do token expirado
            var principal = GetPrincipalFromExpiredToken(tokenDto.Token);
            if(principal is null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Invalid token."
                };
            }

            // Busca o usuário no banco de dados
            var user = await _userManager.FindByEmailAsync(tokenDto.Email);
            if(user == null)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "User not found."
                };
            }

            if(user.RefreshToken != tokenDto.RefreshToken)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Invalid refresh token."
                };
            }

            if(user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return new ResponseDto {
                    IsSuccess = false,
                    Message = "Refresh token expired."
                };
            }

            // Gera um novo token de acesso
            var newToken = await GenerateToken(user);

            // Gera um novo refresh token
            var newRefreshToken = GenerateRefreshToken();

            // Atualiza o refresh token
            user.RefreshToken = newRefreshToken;

            if (!double.TryParse(_configuration["JWTSettings:expiryTime"], out double expiryTime))expiryTime = 2; // Valor padrão de 2 horas se não houver configuração válida

            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddHours(expiryTime);

            var updateResult = await _userManager.UpdateAsync(user);
            if(!updateResult.Succeeded)
            {
                var errorMessage = string.Join(", ", updateResult.Errors.Select(t => t.Description).FirstOrDefault());
                return new ResponseDto {
                    IsSuccess = false,
                    Message = $"Failed to update refresh token: {errorMessage}"
                };
            }

            return new ResponseDto {
                IsSuccess = true,
                Message = "Token refreshed successfully.",
                Token = newToken,
                RefreshToken = newRefreshToken
            };
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JWTSettings").Get<JwtSettingsDTOs>();
            if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecurityKey))
            {
                throw new InvalidOperationException("JWT settings are not properly configured.");
            }

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, // Valida o emissor
                ValidIssuer = jwtSettings.ValidIssuer,

                ValidateAudience = true, // Valida a audiência
                ValidAudience = jwtSettings.ValidAudience,

                ValidateIssuerSigningKey = true, // Valida a chave de assinatura
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecurityKey)),

                ValidateLifetime = false, // Ignora a validação de expiração para tokens expirados
                ClockSkew = TimeSpan.Zero // Remove o "clock skew" para evitar falsos positivos
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                // Valida o token e obtém o principal
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

                // Verifica se o token é um JWT válido e usa o algoritmo correto
                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    throw new SecurityTokenException("Invalid token algorithm.");
                }

                return principal;
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogError(ex, "Security token validation failed.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating token.");
                return null;
            }
        }
    
        public async Task<ResponseDto> Logout(ClaimsPrincipal userPrincipal)
        {
            if (userPrincipal == null)
            {
                throw new UnauthorizedAccessException("User not authenticated.");
            }

            var userId = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User not authenticated.");
            }

            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                // Invalida o RefreshToken
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = DateTime.MinValue;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(t => t.Description).FirstOrDefault());
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to logout user: {errorMessage}"
                    };
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Logout successful."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred during logout."
                };
            }
        }
    }
}