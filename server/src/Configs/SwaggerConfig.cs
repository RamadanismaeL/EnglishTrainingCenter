/*
*@auhtor Ramadan Ismael
*/

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace server.src.Configs
{
    public static class SwaggerConfig
    {
        // Versão da API
        private const string ApiVersion = "v1";

        // Título da API
        private const string ApiTitle = "English Training Center - API";

        // Descrição da API
        private const string ApiDescription = "English Training Center Management API, version 1.0";

        // Nome do contacto responsável pela API
        private const string ContactName = "Ramadan Ismael";

        // Email do contacto para suporte ou dúvidas sobre a API
        private const string ContactEmail = "ramadan.ismael@gmail.com";

        //  URL do contato, podendo ser um perfil no GitHub, site pessoal ou outra referência.
        private const string ContactUrl = "https://github.com/RamadanismaeL";

        // URL dos termos de serviço da API, onde são definidos os direitos e responsabilidades dos usuários.
        private const string TermsUrl = "https://exampleLink.com/terms";

        // Define o esquema de segurança da API para autenticação JWT
        private const string SchemeName = JwtBearerDefaults.AuthenticationScheme;

        // Mensagem de orientação para o usuário sobre como utilizar o esquem de autenticação.
        private const string SchemeDescription = "Enter JWT 'Bearer {token}' to access this API";

        /// <summary>
        /// Define o formato do token utilizado no esquema de segurança JWT.
        /// Geralmente, o formato é "JWT" para indicar que a API usa JSON Web Tokens.
        /// </summary>
        private const string SchemeBearerFormat = "JWT";

        public static void AddSwaggerConfiguration(this IServiceCollection services)
        {
            services.AddSwaggerGen(options => {
                ConfigureSwaggerDoc(options);
                ConfigureJWTAuthentication(options);
            });
        }

        private static void ConfigureSwaggerDoc(SwaggerGenOptions options)
        {
            options.SwaggerDoc(ApiVersion, new OpenApiInfo {
                Title = ApiTitle,
                Version = ApiVersion,
                Description = ApiDescription,
                TermsOfService = new Uri(TermsUrl),
                Contact = new OpenApiContact
                {
                    Name = ContactName,
                    Email = ContactEmail,
                    Url = new Uri(ContactUrl)
                }
            });
        }

        // Token Key = Header.PayLoad.Signature
        private static void ConfigureJWTAuthentication(SwaggerGenOptions options)
        {
            var securityScheme = new OpenApiSecurityScheme
            {
                Description = SchemeDescription,
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                In = ParameterLocation.Header,
                Scheme = "Bearer",
                BearerFormat = SchemeBearerFormat
            };

            options.AddSecurityDefinition(SchemeName, securityScheme);

            var securityRequirement = new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = SchemeName
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            };

            options.AddSecurityRequirement(securityRequirement);
        }
    
        public static void UseSwaggerConfiguration(this IApplicationBuilder app)
        {
            // Habilita o Middleware do Swagger para gerar a documentação da API
            app.UseSwagger();

            // Configura a interface do Swagger UI para visualização e interação com a API
            app.UseSwaggerUI(options => {
                // Define o endpoint do Swagger, apontado para a documentação JSON da API
                // Usa a versão da API definida na constante <c> ApiVersion </c>.
                options.SwaggerEndpoint($"/swagger/{ApiVersion}/swagger.json", $"{ApiTitle} - {ApiVersion}");
                
                // Define o prexifo da rota do Swagger UI.
                // Sem essa configuração: O Swagger UI ficaria acessível em http://localhost:5000/swagger/...
                // Com essa configuração: O Swagger UI estará disponível diretamente em http://localhost:5000/, sem precisar adicionar /swagger/... na URL.
                options.RoutePrefix = string.Empty;

                // Define o título da documentação na aba do navegador
                options.DocumentTitle = "etc-api";

                // Exibe a duração de cada requisição na interface do Swagger UI
                options.DisplayRequestDuration();

                // Habilita um campo de filtro para facilitar a busca por endpoints
                options.EnableFilter();

                // Permite o uso de links diretos para seções específicas da documentação. Isso melhora a navegação dentro do Swagger UI
                options.EnableDeepLinking();

                // Habilita a validação dos modelos de entrada diretamente no Swagger UI
                options.EnableValidator();

                // Exibe os identificadores das operações (OperationID) na documentação
                // Isso pode ser útil para referência em código ou geração automática de clientes
                options.DisplayOperationId();

                // Define a expansão dos endpoints na interface do Swagger
                // A opção <c> DocExpansion.None </c> mantém todos os endpoints recolhidos por padrão
                // O usuário precisa clicar manualmente para expandir um endpoint específico.
                options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
            });
        }
    }
}