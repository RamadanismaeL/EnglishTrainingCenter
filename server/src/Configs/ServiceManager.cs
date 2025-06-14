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
using Quartz;
using server.src.Data;
using server.src.Interfaces;
using server.src.Models;
using server.src.Repositories;

namespace server.src.Configs
{
    public static class ServiceManager
    {
        [Obsolete]
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


                // Configuração do Quartz para controle de mensalidades
                services.AddQuartz(q =>
                {
                    q.UseMicrosoftDependencyInjectionJobFactory();

                    // Definindo o Job para controle de mensalidades e processar jobs perdidos ao reiniciar
                    q.AddJob<MonthlyTuitionJob>(j => j
                        .WithIdentity("MonthlyTuitionJob")
                        .StoreDurably()
                        .WithDescription("Job para controle de mensalidades dos alunos"));

                    q.AddTrigger(trigger => trigger
                        .ForJob("MonthlyTuitionJob")
                        .WithIdentity("MonthlyTuitionJobTrigger")
                        .WithCronSchedule("0 2 0 1 1/1 ? *", x => x
                            .InTimeZone(TimeZoneInfo.Local)
                            .WithMisfireHandlingInstructionFireAndProceed())
                            .StartAt(DateBuilder.EvenSecondDate(DateTimeOffset.UtcNow.AddSeconds(10)))
                            .WithDescription("Dispara o job de mensalidades no dia 1 de cada mês às 00:02:00"));
                    /*
                    .StartNow()
                    .WithSimpleSchedule(schedule => schedule
                        .WithInterval(TimeSpan.FromMinutes(1)) // Executa a cada 1 minuto
                        .RepeatForever()));
                        
                    // Processa jobs perdidos ao reiniciar
                    q.UsePersistentStore(s =>
                    {
                        s.UseProperties = true;
                        s.UseMySql(connectionString);
                    });
                    */
                });

                services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
                // end config.. Quartz.Net


                // Registro de serviços da aplicação
                services.AddScoped<ITrainerRepository, TrainerRepository>();
                services.AddScoped<IRoleRepository, RoleRepository>();
                services.AddScoped<ILoginRepositoy, LoginRepository>();

                // Students
                services.AddScoped<IStudentRepository, StudentRepository>();
                services.AddScoped<IStudentPaymentRepository, StudentPaymentRepository>();
                services.AddScoped<IStudentCourseInfoRepository, StudentCourseInfoRepository>();
                services.AddScoped<IStudentMonthlyTuitionRepository, StudentMonthlyTuitionRepository>();      

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