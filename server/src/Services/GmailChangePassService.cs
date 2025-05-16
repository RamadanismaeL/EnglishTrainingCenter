/*
*@author Ramadan Ismael
*/

using System.Net;
using System.Net.Mail;

namespace server.src.Services
{
    public static class GmailChangePassService
    {
        public static bool SendVerificationCodeEmail(IConfiguration configuration, string userFullName, string userEmail, string code)
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

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!),
                Subject = "Verify Your Identity",
                Body = $@"
                <!DOCTYPE html>
                <html xmlns='http://www.w3.org/1999/xhtml'>
                <head>
                    <title>Verify Your Identity</title>
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
                                                                    Confirm it's you
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    Hi {userFullName},
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    To ensure the security of your account, we're sending you a verification code to confirm it's really you. Please enter the code below:
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 24px 0;'>
                                                                    <span style='width: 100%; background: #22D172; text-decoration: none; display: inline-block; padding: 15px 0; color: #fff; font-size: 25px; line-height: 21px; text-align: center; font-weight: bold; border-radius: 7px;'>{code}</span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 16px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    <p>This code expires in <strong>5 minutes.</strong></p>
                                                                    <strong>Do not share it with anyone for security reasons.</strong>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style='padding: 0 0 60px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;'>
                                                                    If you didn't request this, please ignore this email.
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
                                                </td>
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