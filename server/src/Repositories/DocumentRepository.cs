/*
*@author Ramadan Ismael
*/
/* Download and install := 
Install-Package DinkToPdf # For PDF generation (you already have this)
Magick.NET-Q8-AnyCPU
{ https://wkhtmltopdf.org/downloads.html }
*/

using DinkToPdf;
using DinkToPdf.Contracts;
using server.src.Interfaces;
using server.src.Models;
using ImageMagick;
using PuppeteerSharp;

namespace server.src.Repositories
{
    public class DocumentRepository(IConverter converter) : IDocumentRepository
    {
        private readonly IConverter _converter = converter;
        private static string previousAmountValue = string.Empty;

        public byte[] PdfGenerateEnrollmentForm(StudentEnrollmentFormModel ficha)
        {
            var html = HtmlGenerateEnrollmentForm(ficha);

            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = new GlobalSettings
                {
                    PaperSize = PaperKind.A4,
                    Orientation = Orientation.Portrait,
                    ColorMode = ColorMode.Color,
                    DPI = 1200
                },
                Objects = {
                    new ObjectSettings
                    {
                        HtmlContent = html,
                        WebSettings = {
                            DefaultEncoding = "utf-8"
                        }
                    }
                }
            };

            return _converter.Convert(doc);
        }

        public async Task<byte[]> PngGenerateEnrollmentForm(StudentEnrollmentFormModel ficha)
        {
             var html = HtmlGenerateEnrollmentForm(ficha);
            // Baixar o Chromium se não estiver disponível
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync(); // Baixa a última versão estável do Chromium


            // Iniciar o navegador headless
            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
            using var page = await browser.NewPageAsync();

            // Carregar conteúdo HTML
            await page.SetContentAsync(html);

            // Renderizar diretamente para PNG (8K)
            var screenshotOptions = new ScreenshotOptions
            {
                Type = ScreenshotType.Png,
                FullPage = true
            };

            // Capturar a tela (render em alta qualidade)
            byte[] imageBytes = await page.ScreenshotDataAsync(screenshotOptions);

            // Otimização e redimensionamento em Magick.NET
            using var magickImage = new MagickImage(imageBytes)
            {
                Format = MagickFormat.Png,
                Quality = 500
            };

            // Redimensionar para 8K (7680x4320) mantendo o aspect ratio
            magickImage.Resize(7680, 4320);
            magickImage.FilterType = FilterType.Lanczos;
            magickImage.Strip();
            magickImage.Sharpen(0, 1.0);

            // Retornar imagem otimizada
            return magickImage.ToByteArray();
        }

        public byte[] PdfGeneratePaymentReceipt(StudentPaymentModel ficha)
        {
            var html = HtmlGeneratePaymentReceiptPrint(ficha);

            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = new GlobalSettings
                {
                    PaperSize = PaperKind.A4,
                    Orientation = Orientation.Portrait,
                    ColorMode = ColorMode.Color,
                    DPI = 1200
                },
                Objects = {
                    new ObjectSettings
                    {
                        HtmlContent = html,
                        WebSettings = {
                            DefaultEncoding = "utf-8"
                        }
                    }
                }
            };

            return _converter.Convert(doc);
        }

        public async Task<byte[]> PngGeneratePaymentReceipt(StudentPaymentModel ficha)
        {
            var html = HtmlGeneratePaymentReceipt(ficha);
            // Baixar o Chromium se não estiver disponível
            var browserFetcher = new BrowserFetcher();
            await browserFetcher.DownloadAsync(); // Baixa a última versão estável do Chromium


            // Iniciar o navegador headless
            using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
            using var page = await browser.NewPageAsync();

            // Carregar conteúdo HTML
            await page.SetContentAsync(html);

            // Renderizar diretamente para PNG (8K)
            var screenshotOptions = new ScreenshotOptions
            {
                Type = ScreenshotType.Png,
                FullPage = true
            };

            // Capturar a tela (render em alta qualidade)
            byte[] imageBytes = await page.ScreenshotDataAsync(screenshotOptions);

            // Otimização e redimensionamento em Magick.NET
            using var magickImage = new MagickImage(imageBytes)
            {
                Format = MagickFormat.Png,
                Quality = 500
            };

            // Redimensionar para 8K (7680x4320) mantendo o aspect ratio
            magickImage.Resize(7680, 4320);
            magickImage.FilterType = FilterType.Lanczos;
            magickImage.Strip();
            magickImage.Sharpen(0, 1.0);

            // Retornar imagem otimizada
            return magickImage.ToByteArray();
        }
        
        private static string HtmlGenerateEnrollmentForm(StudentEnrollmentFormModel ficha)
        {
          return $@"
                <!DOCTYPE html>
                <html lang='pt'>
                    <head>
                        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
                        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        <style type='text/css'>
                            body {{ font-family: Arial, sans-serif; color: #1f1f1f; }}
                            .retang {{ border: 1px solid #2f2f2f; border-radius: 10px; padding: 0px 10px; margin-bottom: 8px; }}
                            .input-line {{ border-bottom: 1px solid #2f2f2f; padding: 0px 8px; display: inline-block; min-width: 10px; white-space: pre; }}
                            .space-line {{ padding: 0px 0px 5px 0px }}
                            .assinatura-participante-line {{ border-bottom: 1px solid #555; padding: 0px 203px 0px 203px; }}
                            .assinatura-responsavel-line {{ border-bottom: 1px solid #555; padding: 0 150px 0px 150px; }}
                        </style>
                    </head>
                    <body>
                        <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff' style='margin-bottom: 7px'>
                            <tbody>
                                <tr>
                                    <td valign='top' align='left'> <img src='http://localhost:5104/images/marca.png' width='100' alt='Logo'/> </td>
                                    <td valign='top' align='center'>
                                        <span>
                                            <h1>ENGLISH TRAINING CENTER</h1>
                                            <h2>FICHA DE INSCRIÇÃO PARA FORMAÇÃO</h2>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan='2' valign='top' align='right'>Número de Estudente: {ficha.StudentId}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class='retang'>
                            <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff'>
                                <tbody>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            <h3>DADOS DO CURSO</h3>
                                            Curso: <span class='input-line'>{ficha.CourseName}</span>,&nbsp;&nbsp;
                                            Pacote: <span class='input-line'>{ficha.Package}</span>,&nbsp;&nbsp;
                                            Nível: <span class='input-line'>{ficha.Level}</span>,&nbsp;&nbsp;
                                            Modalidade: <span class='input-line'>{ficha.Modality}</span>,&nbsp;&nbsp;
                                            Período: <span class='input-line'>{ficha.AcademicPeriod}</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            Horário: <span class='input-line'>{ficha.Schedule}</span>,&nbsp;&nbsp;
                                            Duração: <span class='input-line'>{ficha.Duration}</span>,&nbsp;&nbsp;
                                            Mensalidade: <span class='input-line'>{OnAmount(ficha.MonthlyFee)} MT</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' style='padding: 0px 0px 15px 0px'>Dias de aulas: De segunda-feira a quinta-feira</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class='retang'>
                            <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff'>
                                <tbody>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            <h3>DOCUMENTO DE IDENTIFICAÇÃO</h3>
                                            Tipo: <span class='input-line'>{OnConvertData(ficha.StudentData!.DocumentType)}</span>,&nbsp;&nbsp;
                                            Número: <span class='input-line'>{ficha.StudentData!.IdNumber}</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' style='padding: 0px 0px 15px 0px'>
                                            Local de Emissão: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.PlaceOfIssue)}</span>,&nbsp;&nbsp;
                                            Validade: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.ExpirationDate)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class='retang'>
                            <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff'>
                                <tbody>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            <h3>DADOS PESSOAIS</h3>
                                            Nome&nbsp;Completo: <span class='input-line'>{ficha.StudentData!.FullName}</span>,&nbsp;&nbsp;
                                            Data&nbsp;de&nbsp;Nascimento: <span class='input-line'>{ficha.StudentData!.DateOfBirth}</span>,&nbsp;&nbsp;
                                            Idade: <span class='input-line'>{ficha.Age}</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            Gênero: <span class='input-line'>{OnConvertData(ficha.StudentData!.Gender)}</span>,&nbsp;&nbsp;
                                            Estado&nbsp;Civil: <span class='input-line'>{OnConvertData(ficha.StudentData!.MaritalStatus)}</span>,&nbsp;&nbsp;
                                            Nacionalidade: <span class='input-line'>{ficha.StudentData!.Nationality}</span>,&nbsp;&nbsp;                                        
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            Naturalidade: <span class='input-line'>{ficha.StudentData!.PlaceOfBirth}</span>,&nbsp;&nbsp;
                                            Endereço&nbsp;Residencial: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.ResidentialAddress)}</span>,&nbsp;&nbsp;                                        
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' style='padding: 0px 0px 15px 0px'>
                                            Telefone:&nbsp;(+258) <span class='input-line'>{OnCheckSpace(ficha.StudentData!.FirstPhoneNumber)}</span>&nbsp;/&nbsp;<span class='input-line'>{OnCheckSpace(ficha.StudentData!.SecondPhoneNumber)}</span>,&nbsp;&nbsp;
                                            E-mail: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.EmailAddress)}</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' style='padding: 0px 0px 15px 0px'>
                                            Observações: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.AdditionalNotes)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class='retang'>
                            <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff'>
                                <tbody>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            <h3>CONTACTO DE EMERGÊNCIA / RESPONSÁVEL</h3>
                                            Nome&nbsp;Completo: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.GuardFullName)}</span>,&nbsp;&nbsp;
                                            Parentesco: <span class='input-line'>{OnCheckSpace(OnConvertData(ficha.StudentData!.GuardRelationship))}</span>,&nbsp;&nbsp;                                        
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' class='space-line'>
                                            Endereço&nbsp;Residencial: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.GuardResidentialAddress)}</span>,&nbsp;&nbsp;
                                            Telefone:&nbsp;(+258) <span class='input-line'>{OnCheckSpace(ficha.StudentData!.GuardFirstPhoneNumber)}</span>&nbsp;/&nbsp<span class='input-line'>{OnCheckSpace(ficha.StudentData!.GuardSecondPhoneNumber)}</span>,&nbsp;&nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='center' style='padding: 0px 0px 15px 0px'>
                                            E-mail: <span class='input-line'>{OnCheckSpace(ficha.StudentData!.GuardEmailAddress)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class='retang'>
                            <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff'>
                                <tbody>
                                    <tr>
                                        <td valign='middle' align='center'>
                                            <h3>INFORMAÇÃO ÚTIL E CONDIÇÕES DE ADESÃO</h3>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='left'>
                                            <strong>
                                            <ol start='1'>
                                                <li>
                                                    Taxas e Pagamentos
                                                    <ul style='font-weight: normal;'>
                                                        <li>O valor do curso de Inglês é <strong>&nbsp;{OnAmount(ficha.CourseFee)} MT</strong>, dividido em três prestações mensais de <strong>&nbsp;{OnAmount(ficha.Installments)} MT</strong>.</li>
                                                        <li>A primeira prestação deve ser paga antes do início das aulas.</li>
                                                        <li>No ato da inscrição, é obrigatória a apresentação de um documento de identificação válido.</li>
                                                    </ul>
                                                </li>
                                            </ol>    
                                            </strong>                                   
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='left'>
                                            <strong>
                                            <ol start='2'>
                                                <li>
                                                    Comprimissos e Responsabilidades
                                                    <ul style='font-weight: normal;'>
                                                        <li>A inscrição no curso implica a aceitação plena das normas institucionais.</li>
                                                        <li>O(a) participante permanece responsável pelo cumprimento das regras, independentemente da sua frequência às aulas.</li>
                                                    </ul>
                                                </li>
                                            </ol>    
                                            </strong>                                   
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='left'>
                                            <strong>
                                            <ol start='3'>
                                                <li>
                                                    Mensalidades e Penalidades
                                                    <ul style='font-weight: normal;'>
                                                        <li>As mensalidades devem ser pagas entre os dias <strong>&nbsp;01 e 10 de cada mês</strong>.</li>
                                                        <li>O não cumprimento do prazo resultará na <strong>&nbsp;suspensão imediata</strong> do(a) participante até a regularização do pagamento.</li>
                                                    </ul>
                                                </li>                                            
                                            </ol>    
                                            </strong>                                   
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='left'>
                                            <strong>
                                            <ol start='4'>
                                                <li>
                                                    Pontualidade e Conduta
                                                    <ul style='font-weight: normal;'>
                                                        <li>A pontualidade é obrigatória. O acesso à sala será vedado em caso de atrasos.</li>
                                                        <li>O(a) participante deve apresentar-se com vestimenta adequada ao ambiente acadêmico.</li>
                                                    </ul>
                                                </li>
                                            </ol>    
                                            </strong>                                   
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign='middle' align='left'>
                                            <strong>
                                            <ol start='5'>
                                                <li>
                                                    Regras Gerais
                                                    <ul style='font-weight: normal;'>
                                                        <li>Não serão realizados reembolsos de valores pagos, sob qualquer circunstância.</li>
                                                        <li>É obrigatória a apresentação dos comprovativos de pagamento sempre que solicitado.</li>
                                                        <li>O(a) participante deverá frequentar as aulas exclusivamente nos horários e dias estabelecidos no ato da inscrição.</li>
                                                        <li>Ao prosseguir com a inscrição, o(a) participante declara estar ciente e de acordo com todas as condições estabelecidas neste documento.</li>                                                    
                                                    </ul>
                                                </li>
                                            </ol>    
                                            </strong>                                   
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <table width='100%' cellspacing='0' cellpadding='0' border='0' align='center' bgcolor='#fff' style='padding: 100px 0 0 0'>
                            <tbody>
                                <tr>
                                    <td valign='middle' align='center' class='space-line'>
                                        Maputo,&nbsp;<span class='input-line'>{ficha.Days}</span>&nbsp;
                                        de&nbsp;<span class='input-line'>{ficha.Months}</span>&nbsp;
                                        de&nbsp;<span class='input-line'>{ficha.Years}</span>
                                    </td>                             
                                </tr>
                                <tr>
                                    <td valign='middle' align='center' style='padding: 0 0 30px 0'>
                                        <small>Hora: {OnCheckSpace(ficha.Times.ToString("HH:mm:ss"))}</small>
                                    </td>                                
                                </tr>
                                <tr>
                                    <td valign='middle' align='left' style='padding: 0 0 20px 0'>
                                        Assinatura do(a) Participante:<span class='assinatura-participante-line'></span>
                                    </td>                              
                                </tr>
                                <tr>
                                    <td valign='middle' align='left' class='space-line'>
                                        Assinatura do(a) Responsável (se aplicável):<span class='assinatura-responsavel-line'></span>
                                    </td>                                
                                </tr>
                                <tr>
                                    <td valign='middle' align='center' style='padding: 50px 0 18px 0'>
                                        <strong>Recebido por</strong>
                                    </td>                                
                                </tr>
                                <tr>
                                    <td valign='middle' align='center' class='space-line'>
                                        <span class='assinatura-participante-line'></span>
                                    </td>                              
                                </tr>
                                <tr> 
                                    <td valign='middle' align='center'>
                                        Assinatura e Carimbo
                                    </td>                                
                                </tr>
                            </tbody>
                        </table>
                        <footer style='width: 100%; text-align: center; margin-top: 720px;'>
                            <small>&copy; 2025 | Developed by Ramadan Ibraimo A. Ismael · License: English Training Center</small>
                        </footer>
                    </body>
                </html>
                ";
        }

        private static string HtmlGeneratePaymentReceipt(StudentPaymentModel ficha)
        {
            string banco = "";
            string eMola = "";
            string mPesa = "";
            string numerario = "";

            if (ficha.Method == "Bank")
            { banco = "X"; }
            else if (ficha.Method == "Cash")
            { numerario = "X"; }
            else if (ficha.Method == "E-Mola")
            { eMola = "X"; }
            else if (ficha.Method == "M-Pesa")
            { mPesa = "X"; }

            return $@"
                <!DOCTYPE html>
                <html lang='pt'>
                <head>
                    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style type='text/css'>
                        @page {{ size: A4; margin: 1cm; }}
                        body {{ 
                            font-family: Arial, sans-serif; 
                            color: #1f1f1f;
                            margin: 0;
                            padding: 0;
                            width: 250mm;
                        }}
                        .container {{
                            width: 100%;
                            max-width: 250mm;
                            padding: 5mm;
                        }}
                        .retang {{ 
                            border: 1px solid #2f2f2f; 
                            border-radius: 8px; 
                            padding: 5px 10px; 
                            margin-bottom: 5px; 
                        }}
                        .retang-value {{ 
                            background-color: #dddddd; 
                            border-radius: 7px; 
                            padding: 8px 10px; 
                            display: inline-block; 
                            width: 150px; 
                            text-align: center; 
                            font-size: 12pt;
                        }}
                        .input-line {{ 
                            border-bottom: 1px solid #2f2f2f; 
                            padding: 0 20px; 
                            display: inline-block; 
                            min-width: 10px; 
                        }}
                        .space-line {{ padding: 0 0 2px 0 }}
                        .space-col {{ padding: 0 5px 0 0 }}
                        .assinatura-participante-line {{
                            border-bottom: 1px solid #555; 
                            width: 400px;
                            margin: 30px 0 2px 30px;
                        }}
                        h1 {{ font-size: 16pt; }}
                        h2 {{ font-size: 14pt; }}
                        table {{ width: 100%; border-collapse: collapse; }}
                        .payment-method {{
                            display: block;
                            margin-right: 15px;
                            margin-bottom: 5px;
                            vertical-align: top;
                        }}
                        .payment-icon {{
                            border: 1px solid #2f2f2f;
                            border-radius: 7px;
                            display: inline-block;
                            width: 25px;
                            height: 25px;
                            text-align: center;
                            font-size: 18pt;
                            line-height: 25px;
                            vertical-align: middle;
                        }}
                        .payment-label {{
                            font-size: 11pt;
                            margin-left: 5px;
                            vertical-align: middle;
                        }}
                        .wide-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 685px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        .wide-field-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 838px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        .wide-field-field-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 741px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        @media print {{
                            body {{ 
                                width: 100%;
                                height: 100%;
                                margin: 0;
                                padding: 0;
                            }}
                            .no-print {{ display: none; }}
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <!-- First Receipt -->
                        <table cellspacing='0' cellpadding='0'>
                            <tr>
                                <td valign='middle' class='space-col'>
                                    <div class='retang space-col'>
                                        <table>
                                            <tr>                                              
                                                <td valign='middle' align='center' class='space-col'>
                                                    <img src='http://localhost:5104/images/marca.png' width='80' alt='Logo' style='padding: 8px 0 1px 0'/>
                                                </td>
                                                <td valign='middle' align='left'>
                                                    <div class='space-line' style='font-size: 10pt'>Rua do Cemitério, Machava Bedene</div>
                                                    <div class='space-line' style='font-size: 10pt'>Tel.: (+258) 84 767 5145 / 87 767 5145</div>
                                                    <div class='space-line' style='font-size: 10pt'>Email: etc@gmail.com</div>
                                                    <div style='font-size: 9pt'>Maputo - Moçambique</div>
                                                </td>                                          
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                                <td rowspan='2' valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='padding: 15px 0'>
                                        <div style='font-size: 18pt; font-weight: bold;'>ENGLISH TRAINING CENTER</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>COMPROVATIVO DE PAGAMENTO</div>
                                        <div style='font-size: 12pt; font-weight: bold; padding-top: 5px;'>
                                            VALOR
                                            <span class='retang-value'>{ OnAmount(ficha.AmountMT) }</span>
                                            MT
                                        </div>  
                                    </div>                                    
                                </td>
                                <td rowspan='2' valign='middle' align='center'>
                                    <div class='retang' style='padding: 40px 0'>
                                        <div style='font-size: 12pt; font-weight: bold;'>RECIBO Nº</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>{ OnCheckSpace(ficha.Id) }</div>
                                    </div>                                    
                                </td>
                            </tr>
                            <tr>
                                <td valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='font-size: 11pt; padding: 5px 0;'>
                                        Número de Estudente: { OnCheckSpace(ficha.StudentId) }
                                    </div>
                                </td>
                            </tr>  
                        </table>

                        <div class='retang' style='margin-top: 5px;'>
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                Recebi(emos) do(a) Exmo.(a) Sr.(a)
                                <span class='wide-field'>{ OnCheckSpace(ficha.ReceivedFrom) }</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                a quantia de 
                                <span class='wide-field-field'>{ OnCheckSpace(ficha.InWords) }</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                referente ao pagamento da 
                                <span class='wide-field-field-field'>{ OnCheckSpace(ficha.DescriptionPortuguese) }</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 10px 0;'>
                                de que passamos o presente recibo.
                            </div> 

                            <div style='margin: 10px 0 5px 0; font-size: 11pt;'>
                                Forma de Pagamento:
                            </div>
                            <div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{banco}</span>
                                    <span class='payment-label'>Banco</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{eMola}</span>
                                    <span class='payment-label'>E-Mola</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{mPesa}</span>
                                    <span class='payment-label'>M-Pesa</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{numerario}</span>
                                    <span class='payment-label'>Numerário</span>
                                </div>
                            </div>

                            <div style='text-align: right; margin-top: 20px;'>
                                <div style='display: inline-block; width: 50%; text-align: center;'>
                                    <div>
                                        Maputo, <span class='input-line'>{ ficha.Days }</span> de 
                                        <span class='input-line' style='padding: 0 50px'>{ OnCheckSpace(ficha.Months) }</span> de 
                                        <span class='input-line'>{ ficha.Years }</span>
                                    </div>
                                    <div style='font-size: 10pt; margin-top: 5px;'>
                                        Hora: {OnCheckSpace(ficha.Times)}
                                    </div>
                                    <div style='margin-top: 20px; padding: 10px 0;'>
                                        Recebido por
                                    </div>
                                    <div class='assinatura-participante-line'></div>
                                    <div style='font-size: 10pt;'>Assinatura e Carimbo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style='width: 100%; text-align: center;'>
                        <small>&copy; 2025 | Developed by Ramadan Ibraimo A. Ismael · License: English Training Center</small>
                    </div>
                </body>
                </html>
            ";
        }

        private static string HtmlGeneratePaymentReceiptPrint(StudentPaymentModel ficha)
        {
            string banco = "";
            string eMola = "";
            string mPesa = "";
            string numerario = "";

            if (ficha.Method == "Bank")
            { banco = "X"; }
            else if (ficha.Method == "Cash")
            { numerario = "X"; }
            else if (ficha.Method == "E-Mola")
            { eMola = "X"; }
            else if (ficha.Method == "M-Pesa")
            { mPesa = "X"; }

            return $@"
                <!DOCTYPE html>
                <html lang='pt'>
                <head>
                    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
                    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style type='text/css'>
                        @page {{ size: A4; margin: 1cm; }}
                        body {{ 
                            font-family: Arial, sans-serif; 
                            color: #1f1f1f;
                            margin: 0;
                            padding: 0;
                            width: 250mm;
                            height: 297mm;
                        }}
                        .container {{
                            width: 100%;
                            max-width: 250mm;
                            padding: 5mm;
                        }}
                        .retang {{ 
                            border: 1px solid #2f2f2f; 
                            border-radius: 8px; 
                            padding: 5px 10px; 
                            margin-bottom: 5px; 
                        }}
                        .retang-value {{ 
                            background-color: #dddddd; 
                            border-radius: 7px; 
                            padding: 8px 10px; 
                            display: inline-block; 
                            width: 150px; 
                            text-align: center; 
                            font-size: 12pt;
                        }}
                        .input-line {{ 
                            border-bottom: 1px solid #2f2f2f; 
                            padding: 0 20px; 
                            display: inline-block; 
                            min-width: 10px; 
                        }}
                        .space-line {{ padding: 0 0 2px 0 }}
                        .space-col {{ padding: 0 5px 0 0 }}
                        .assinatura-participante-line {{
                            border-bottom: 1px solid #555; 
                            width: 400px;
                            margin: 30px 0 2px 30px;
                        }}
                        h1 {{ font-size: 16pt; }}
                        h2 {{ font-size: 14pt; }}
                        table {{ width: 100%; border-collapse: collapse; }}
                        .payment-method {{
                            display: block;
                            margin-right: 15px;
                            margin-bottom: 5px;
                            vertical-align: top;
                        }}
                        .payment-icon {{
                            border: 1px solid #2f2f2f;
                            border-radius: 7px;
                            display: inline-block;
                            width: 25px;
                            height: 25px;
                            text-align: center;
                            font-size: 18pt;
                            line-height: 25px;
                            vertical-align: middle;
                        }}
                        .payment-label {{
                            font-size: 11pt;
                            margin-left: 5px;
                            vertical-align: middle;
                        }}
                        .wide-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 685px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        .wide-field-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 838px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        .wide-field-field-field {{
                            background-color: #dddddd;
                            border-radius: 7px;
                            padding: 6px 8px;
                            display: inline-block;
                            width: 742px;
                            box-sizing: border-box;
                            margin: 1px 0;
                            font-size: 12pt;
                        }}
                        @media print {{
                            body {{ 
                                width: 100%;
                                height: 100%;
                                margin: 0;
                                padding: 0;
                            }}
                            .no-print {{ display: none; }}
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <!-- First Receipt -->
                        <table cellspacing='0' cellpadding='0'>
                            <tr>
                                <td valign='middle' class='space-col'>
                                    <div class='retang space-col'>
                                        <table>
                                            <tr>                                              
                                                <td valign='middle' align='center' class='space-col'>
                                                    <img src='http://localhost:5104/images/marca.png' width='80' alt='Logo' style='padding: 8px 0 1px 0'/>
                                                </td>
                                                <td valign='middle' align='left'>
                                                    <div class='space-line' style='font-size: 10pt'>Rua do Cemitério, Machava Bedene</div>
                                                    <div class='space-line' style='font-size: 10pt'>Tel.: (+258) 84 767 5145 / 87 767 5145</div>
                                                    <div class='space-line' style='font-size: 10pt'>Email: etc@gmail.com</div>
                                                    <div style='font-size: 9pt'>Maputo - Moçambique</div>
                                                </td>                                          
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                                <td rowspan='2' valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='padding: 15px 0'>
                                        <div style='font-size: 18pt; font-weight: bold;'>ENGLISH TRAINING CENTER</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>COMPROVATIVO DE PAGAMENTO</div>
                                        <div style='font-size: 12pt; font-weight: bold; padding-top: 5px;'>
                                            VALOR
                                            <span class='retang-value'>{OnAmount(ficha.AmountMT)}</span>
                                            MT
                                        </div>  
                                    </div>                                    
                                </td>
                                <td rowspan='2' valign='middle' align='center'>
                                    <div class='retang' style='padding: 40px 0'>
                                        <div style='font-size: 12pt; font-weight: bold;'>RECIBO Nº</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>{OnCheckSpace(ficha.Id)}</div>
                                    </div>                                    
                                </td>
                            </tr>
                            <tr>
                                <td valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='font-size: 11pt; padding: 5px 0;'>
                                        Número de Estudente: {OnCheckSpace(ficha.StudentId)}
                                    </div>
                                </td>
                            </tr>  
                        </table>

                        <div class='retang' style='margin-top: 5px;'>
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                Recebi(emos) do(a) Exmo.(a) Sr.(a)
                                <span class='wide-field'>{OnCheckSpace(ficha.ReceivedFrom)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                a quantia de 
                                <span class='wide-field-field'>{OnCheckSpace(ficha.InWords)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                referente ao pagamento da 
                                <span class='wide-field-field-field'>{OnCheckSpace(ficha.DescriptionPortuguese)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 10px 0;'>
                                de que passamos o presente recibo.
                            </div> 

                            <div style='margin: 10px 0 5px 0; font-size: 11pt;'>
                                Forma de Pagamento:
                            </div>
                            <div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{banco}</span>
                                    <span class='payment-label'>Banco</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{eMola}</span>
                                    <span class='payment-label'>E-Mola</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{mPesa}</span>
                                    <span class='payment-label'>M-Pesa</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{numerario}</span>
                                    <span class='payment-label'>Numerário</span>
                                </div>
                            </div>

                            <div style='text-align: right; margin-top: 20px;'>
                                <div style='display: inline-block; width: 50%; text-align: center;'>
                                    <div>
                                        Maputo, <span class='input-line'>{ficha.Days}</span> de 
                                        <span class='input-line' style='padding: 0 50px'>{OnCheckSpace(ficha.Months)}</span> de 
                                        <span class='input-line'>{ficha.Years}</span>
                                    </div>
                                    <div style='font-size: 10pt; margin-top: 5px;'>
                                        Hora: {OnCheckSpace(ficha.Times)}
                                    </div>
                                    <div style='margin-top: 20px; padding: 10px 0;'>
                                        Recebido por
                                    </div>
                                    <div class='assinatura-participante-line'></div>
                                    <div style='font-size: 10pt;'>Assinatura e Carimbo</div>
                                </div>
                            </div>
                        </div>
                        <div style='width: 100%; text-align: center;'>
                            <small>&copy; 2025 | Developed by Ramadan Ibraimo A. Ismael · License: English Training Center</small>
                        </div>

                        <div style='border-top: 1px dashed #2f2f2f; margin: 35px 0;'></div>

                        <!-- Second Receipt (Duplicate) -->                        
                        <table cellspacing='0' cellpadding='0'>
                            <tr>
                                <td valign='middle' class='space-col'>
                                    <div class='retang space-col'>
                                        <table>
                                            <tr>                                              
                                                <td valign='middle' align='center' class='space-col'>
                                                    <img src='http://localhost:5104/images/marca.png' width='80' alt='Logo' style='padding: 8px 0 1px 0'/>
                                                </td>
                                                <td valign='middle' align='left'>
                                                    <div class='space-line' style='font-size: 10pt'>Rua do Cemitério, Machava Bedene</div>
                                                    <div class='space-line' style='font-size: 10pt'>Tel.: (+258) 84 767 5145 / 87 767 5145</div>
                                                    <div class='space-line' style='font-size: 10pt'>Email: etc@gmail.com</div>
                                                    <div style='font-size: 9pt'>Maputo - Moçambique</div>
                                                </td>                                          
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                                <td rowspan='2' valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='padding: 15px 0'>
                                        <div style='font-size: 18pt; font-weight: bold;'>ENGLISH TRAINING CENTER</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>COMPROVATIVO DE PAGAMENTO</div>
                                        <div style='font-size: 12pt; font-weight: bold; padding-top: 5px;'>
                                            VALOR
                                            <span class='retang-value'>{OnAmount(ficha.AmountMT)}</span>
                                            MT
                                        </div>  
                                    </div>                                    
                                </td>
                                <td rowspan='2' valign='middle' align='center'>
                                    <div class='retang' style='padding: 40px 0'>
                                        <div style='font-size: 12pt; font-weight: bold;'>RECIBO Nº</div>
                                        <div style='font-size: 14pt; font-weight: bold;'>{OnCheckSpace(ficha.Id)}</div>
                                    </div>                                    
                                </td>
                            </tr>
                            <tr>
                                <td valign='middle' align='center' class='space-col'>
                                    <div class='retang' style='font-size: 11pt; padding: 5px 0;'>
                                        Número de Estudente: {OnCheckSpace(ficha.StudentId)}
                                    </div>
                                </td>
                            </tr>  
                        </table>

                        <div class='retang' style='margin-top: 5px;'>
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                Recebi(emos) do(a) Exmo.(a) Sr.(a)
                                <span class='wide-field'>{OnCheckSpace(ficha.ReceivedFrom)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                a quantia de 
                                <span class='wide-field-field'>{OnCheckSpace(ficha.InWords)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 5px 0;'>
                                referente ao pagamento da 
                                <span class='wide-field-field-field'>{OnCheckSpace(ficha.DescriptionPortuguese)}</span>
                            </div> 
                            <div style='font-size: 11pt; padding: 10px 0;'>
                                de que passamos o presente recibo.
                            </div> 

                            <div style='margin: 10px 0 5px 0; font-size: 11pt;'>
                                Forma de Pagamento:
                            </div>
                            <div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{banco}</span>
                                    <span class='payment-label'>Banco</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{eMola}</span>
                                    <span class='payment-label'>E-Mola</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{mPesa}</span>
                                    <span class='payment-label'>M-Pesa</span>
                                </div>
                                <div class='payment-method'>
                                    <span class='payment-icon'>{numerario}</span>
                                    <span class='payment-label'>Numerário</span>
                                </div>
                            </div>

                            <div style='text-align: right; margin-top: 20px;'>
                                <div style='display: inline-block; width: 50%; text-align: center;'>
                                    <div>
                                        Maputo, <span class='input-line'>{ficha.Days}</span> de 
                                        <span class='input-line' style='padding: 0 50px'>{OnCheckSpace(ficha.Months)}</span> de 
                                        <span class='input-line'>{ficha.Years}</span>
                                    </div>
                                    <div style='font-size: 10pt; margin-top: 5px;'>
                                        Hora: {OnCheckSpace(ficha.Times)}
                                    </div>
                                    <div style='margin-top: 20px; padding: 10px 0;'>
                                        Recebido por
                                    </div>
                                    <div class='assinatura-participante-line'></div>
                                    <div style='font-size: 10pt;'>Assinatura e Carimbo</div>
                                </div>
                            </div>
                        </div>
                        <div style='width: 100%; text-align: center;'>
                            <small>&copy; 2025 | Developed by Ramadan Ibraimo A. Ismael · License: English Training Center</small>
                        </div>
                    </div>                    
                </body>
                </html>
            ";
        }

        private static string OnAmount(decimal value)
        {
            // Verifica o valor máximo
            if (value > 10000000000m)
            {
                return previousAmountValue ?? string.Empty;
            }

            // Formata o valor com separadores de milhar e 2 casas decimais
            string formattedValue = value.ToString("#,##0.00", System.Globalization.CultureInfo.GetCultureInfo("pt-BR"));

            // Armazena o valor formatado para uso futuro
            previousAmountValue = formattedValue;

            return formattedValue;
        }

        private static string OnConvertData(string value)
        {
            if (value == "M")
            { return "Masculino"; }
            else if (value == "F")
            { return "Feminino"; }
            else if (value == "Single")
            { return "Solteiro(a)"; }
            else if (value == "Married")
            { return "Casado(a)"; }
            else if (value == "Divorced")
            { return "Divorciado(a)"; }
            else if (value == "Widowed")
            { return "Viúvo(a)"; }
            else if (value == "Separated")
            { return "Separado(a)"; }
            else if (value == "BI")
            { return "BI"; }
            else if (value == "Birth Certificate")
            { return "Certidão de Nascimento"; }
            else if (value == "Driver's Licence")
            { return "Carta de Condução"; }
            else if (value == "Passport")
            { return "Passaporte"; }
            else if (value == "Voter's Card")
            { return "Cartão de Eleitor"; }
            else if (value == "Work Card")
            { return "Carteira de Trabalho"; }
            else if (value == "Spouse")
            { return "Cônjuge"; }
            else if (value == "Parent")
            { return "Pai/Mãe"; }
            else if (value == "Sibling")
            { return "Irmão/Irmã"; }
            else if (value == "Child")
            { return "Filho/Filha"; }
            else if (value == "Friend")
            { return "Amigo/Amiga"; }
            else if (value == "Colleague")
            { return "Colega"; }
            else if (value == "Other")
            { return "Outro"; }

            return value;
        }

        private static string OnCheckSpace(string value)
        {
            if (!string.IsNullOrWhiteSpace(value)) return value;

            return "--";
        }        
    }
}