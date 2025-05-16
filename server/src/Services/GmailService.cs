/*
*@author Ramadan Ismael
*/

using System.Net;
using System.Net.Mail;

namespace server.src.Services
{
    public static class GmailService
    {
        public static bool SendVerificationCodeEmail(IConfiguration configuration, string userEmail, string code)
        {
            // Configurações do Gmail
            var fromEmail = configuration.GetSection("Gmail").GetSection("FromEmail").Value;
            var fromPassword = configuration.GetSection("Gmail").GetSection("FromPassword").Value;

            // Configuração do cliente SMTP
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(fromEmail, fromPassword),
                EnableSsl = true,
            };

            /* Criação da mensagem de e-mail
            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!),
                Subject = "Verification Code",
                Body = $"<h2>ENGLISH TRAINING CENTER</h2></br><h1> Your verification code is: {code} </h1>",
                IsBodyHtml = true
            };

            string resourceName = "server.src.assets.images.marca.png";

            // Obtém o assembly atual
            var assembly = Assembly.GetExecutingAssembly();

            // Verifica se o recurso existe
            if (assembly.GetManifestResourceStream(resourceName) != null)
            {
                Console.WriteLine("Imagem encontrada!");

                // Lê a imagem como um stream
                using (var stream = assembly.GetManifestResourceStream(resourceName))
                {
                    // Converte o stream para um array de bytes (opcional)
                    byte[] imageBytes = new byte[stream!.Length];
            _ = stream.Read(imageBytes, 0, imageBytes.Length);

                    // Use a imagem como necessário (ex: converter para Base64)
                    string base64String = Convert.ToBase64String(imageBytes);
                    string imageSrc = $"data:image/png;base64,{base64String}";

                    Console.WriteLine("Imagem em Base64:");
                // Console.WriteLine(imageSrc);
                }
            }
            else
            {
                Console.WriteLine("Imagem não encontrada no assembly.");
            }
            */

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!),
                Subject = "Verification Code",
                Body = $@"
                <!DOCTYPE html>
                <html xmlns='http://www.w3.org/1999/xhtml'>
                <head>
                    <title>Verification Code</title>
                    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style type='text/css'>
                        #outlook a {{ padding: 0; }}
                        .ReadMsgBody {{ width: 100%; }}
                        .ExternalClass {{ width: 100%; }}
                        .ExternalClass * {{ line-height: 100%; }}
                        body {{ margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
                        table, td {{ border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
                        @media only screen and (max-width:480px) {{
                            @-ms-viewport {{ width: 320px; }}
                            @viewport {{ width: 320px; }}
                        }}
                        @media only screen and (max-width:595px) {{
                            .container {{ width: 100% !important; }}
                            .button {{ display: block !important; width: auto !important; }}
                        }}
                    </style>
                </head>
                <body style='font-family: 'Inter', sans-serif; background: #E5E5E5;'>
                    <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#F6FAFB'>
                        <tbody>
                            <tr>
                                <td valign='top' align='center'>
                                    <table class='container' width='600' cellspacing='0' cellpadding='0' border='0'>
                                        <tbody>
                                            <tr>
                                                <td style='padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;'>
                                                    <div style='text-align: center;'>
                                                        <img src='https://mailsend-email-assets.mailtrap.io/fluq3nuck9m25h8mcei1hol1gw43.png' width='70' />
                                                    </div>
                                                    <span>ENGLISH TRAINING CENTER</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class='main-content' style='padding: 48px 30px 40px; color: #000000;' bgcolor='#ffffff'>
                                                    <table width='100%' cellspacing='0' cellpadding='0' border='0'>
                                                        <tbody>
                                                            <tr>
                                                                <td style='padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;'>
                                                                    Hello! Forgot your password?
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    We received a password reset request for your account: <span style='color: #4C83EE;'>{userEmail}</span>.
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 700; color: #000000; letter-spacing: 0.01em;'>
                                                                    To proceed, please use the verification code below. Your verification code expires after 5 minutes.
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 24px 0;'>
                                                                    <span style='width: 100%; background: #22D172; text-decoration: none; display: inline-block; padding: 15px 0; color: #fff; font-size: 25px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;'>{code}</span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 60px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    If you didn’t request the password reset, please ignore this message or contact me for assistance.
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 16px;'>
                                                                    <span style='display: block; width: 117px; border-bottom: 1px solid #8B949F;'></span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    Best regards, <br><strong>Ramadan IsmaeL</strong>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding: 24px 0 48px; font-size: 0px;'>
                                                    <div class='outlook-group-fix' style='padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;'>
                                                        <span style='padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;'>Developed by Ramadan Ibraimo A. Ismael | &copy; 2025<br/>All rights reserved</span>
                                                    </div>
                                                </<tbody>
                                            <tr>
                                                <td style='padding:48px 0 30px 0; text-align: center; font-size: 14px; color: #4C83EE;'>
                                                    <div style='text-align: center;'>
                                                        <img src='https://mailsend-email-assets.mailtrap.io/fltd>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                </html>",
                IsBodyHtml = true
            };

            mailMessage.To.Add(userEmail);

            try
            {
                smtpClient.Send(mailMessage);
                return true;
            }
            catch (SmtpException ex)
            {
                // Log do erro
                Console.WriteLine($"Erro ao enviar e-mail: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return false;
            }
            catch (Exception ex)
            {
                // Log de erros genéricos
                Console.WriteLine($"Erro inesperado: {ex.Message}");
                return false;
            }
        }
    }
}