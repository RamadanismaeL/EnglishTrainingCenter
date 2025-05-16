/*
*@auhtor Ramadan Ismael
*/

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using server.src.DTOs;

namespace server.src.Configs
{
    public static class JWTConfig
    {
        /// <summary>
        /// Configura a autenticação para a aplicação
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        /// <param name="logger"></param>
        public static void AddJWTAuthentication(this IServiceCollection services, IConfiguration configuration, ILogger logger)
        {
            try
            {
                var jwtSettings = configuration.GetSection("JWTSettings").Get<JwtSettingsDTOs>();

                if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.ValidAudience) || string.IsNullOrEmpty(jwtSettings.ValidIssuer) || string.IsNullOrEmpty(jwtSettings.SecurityKey))
                {
                    throw new InvalidOperationException("JWT settings are not properly configured.");
                }

                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;

                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                    {
                        options.RequireHttpsMetadata = true; // false apenas para desenvolvimento, true para produção
                        options.SaveToken = true;
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidIssuer = jwtSettings.ValidIssuer,

                            ValidateAudience = true,
                            ValidAudience = jwtSettings.ValidAudience,
                            RequireAudience = true,

                            ValidateLifetime = true,
                            RequireExpirationTime = true,

                            ClockSkew = TimeSpan.FromMilliseconds(500),

                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecurityKey)),
                            RequireSignedTokens = true
                        }; 

                        // Configuração específica para SignalR
                        options.Events = new JwtBearerEvents
                        {
                            OnMessageReceived = context =>
                            {
                                var accessToken = context.Request.Query["access_token"];
                                
                                // Se o request for para o hub
                                var path = context.HttpContext.Request.Path;
                                if (!string.IsNullOrEmpty(accessToken) && 
                                    path.StartsWithSegments("/notificationHub"))
                                {
                                    context.Token = accessToken;
                                }
                                return Task.CompletedTask;
                            }
                        };                    
                    }
                );

                //logger.LogInformation("JWT authentication configured successfully.");
                //Console.WriteLine( "Tempo de expiração:  ", jwtSettings.ExpiryTime!);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to configure JWT authentication.");
                throw;
            }
        }
    }
}