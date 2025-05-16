/*
*@author Ramadan Ismael
*/

using RestSharp;
using server.src.Interfaces;

namespace server.src.Services
{
    public static class EmailService
    {
        public static bool SendVerificationCodeEmail(IConfiguration configuration, string userEmail, string code)
        {
            // Verificação das configurações
            var fromEmail = configuration.GetSection("MailTrap").GetSection("FromEmail").Value;
            var templateUuid = configuration.GetSection("MailTrap").GetSection("TemplateUuid").Value;

            var client = new RestClient("https://send.api.mailtrap.io/api/send");            
            var request = new RestRequest
            {
                Method = Method.Post,
                RequestFormat = DataFormat.Json
            };

            request.AddHeader("Authorization", "Bearer ad03370cd96f96fad70fa68b235e5fc4");
            request.AddJsonBody(new {
                from = new { email = fromEmail },
                to = new[] { new { email = userEmail } },
                template_uuid = templateUuid,
                template_variables = new { user_email = userEmail, pass_reset_link = code }
            });

            var response = client.Execute(request);
                
            if(response.IsSuccessful)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}