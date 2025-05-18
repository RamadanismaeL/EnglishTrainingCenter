/*
*@auhtor Ramadan Ismael
*/

using DinkToPdf;
using DinkToPdf.Contracts;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using server.src.Data;
using server.src.Interfaces;
using server.src.Models;
using server.src.Repositories;

namespace server.src.Configs
{
    public static class ServiceManager
    {
        public static void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<Program>();

            try
            {
                 // Pegando variáveis de ambiente e verificando se estão definidas
                var getUserName = GetEnvVariable("DB_USERNAME");
                var getPassword = GetEnvVariable("DB_PASSWORD");
                var getPort = GetEnvVariable("DB_PORT");
                var getServer = GetEnvVariable("DB_SERVER");

                var connectionString = new MySqlConnectionStringBuilder
                {
                    Server = getServer,
                    Port = uint.Parse(getPort),
                    Database = "dbETC",
                    UserID = getUserName,
                    Password = getPassword,
                    PersistSecurityInfo = false,
                    ConnectionTimeout = 60,
                    SslMode = MySqlSslMode.Required // Conexão segura
                }.ConnectionString;

                // Configuração do banco de dados
                services.AddDbContextPool<ServerDbContext>(options =>
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

                services.AddIdentity<TrainerModel, IdentityRole>()
                    .AddEntityFrameworkStores<ServerDbContext>()
                    .AddDefaultTokenProviders();

                services.AddOpenApi();
                // Para comunicação em tempo real
                services.AddSignalR();

                // Validação para FluentValidation
                services.AddValidatorsFromAssembly(typeof(Program).Assembly);
                services.AddControllers().Services
                    .AddFluentValidationAutoValidation(); // Validação automática com FluentValidation

                services.AddEndpointsApiExplorer();
                services.AddSwaggerConfiguration(); // Método customizado para configurar o Swagger

                // Configuração do JWT Authentication
                services.AddJWTAuthentication(configuration, logger);
                services.AddAuthorization(); // Para configuração de autorização baseada em roles ou claims

                services.AddScoped<IConverter, SynchronizedConverter>(_ => new SynchronizedConverter(new PdfTools()));
                services.AddSingleton<IDocumentRepository, DocumentRepository>();

                // Registro de serviços da aplicação
                services.AddScoped<ITrainerRepository, TrainerRepository>();
                services.AddScoped<IRoleRepository, RoleRepository>();
                services.AddScoped<ILoginRepositoy, LoginRepository>();
                services.AddScoped<IStudentRepository, StudentRepository>();
                services.AddScoped<IStudentPaymentRepository, StudentPaymentRepository>();
                services.AddScoped<IStudentCourseInfoRepository, StudentCourseInfoRepository>();          

                // Settings
                services.AddScoped<ISettingRepository, SettingRepository>();

                // Configuração de CORS (Cross-Origin Resource Sharing)
                services.AddCors(ram => {
                    ram.AddPolicy("etcClient", ram => {
                        ram.WithOrigins(configuration.GetSection("JWTSettings").GetSection("validAudience").Value!)
                        .WithMethods("POST", "GET", "PUT", "PATCH", "DELETE")
                        .AllowAnyHeader()                      
                        .AllowCredentials();
                    });
                });
            }
            catch(Exception ex)
            {
                logger.LogError($"Error in ServiceManger - Configure : {ex.Message}");
                throw;
            }
        }

        private static string GetEnvVariable(string key)
        {
            return Environment.GetEnvironmentVariable(key) 
                ?? throw new InvalidOperationException($"{key} is not defined in the environment.");
        }
    }
}