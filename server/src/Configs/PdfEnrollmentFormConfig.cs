/*
@author: Ramadan Ismael
*/

using DinkToPdf;
using DinkToPdf.Contracts;

namespace server.src.Configs
{
    public class FichaInscricao
    {
        public string? NomeCompleto { get; set; }
        public DateTime DataNascimento { get; set; }
        public string? Genero { get; set; }
        public string? Nacionalidade { get; set; }
        public string? DocumentoIdentificacao { get; set; }
        public string? Endereco { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? CursoPretendido { get; set; }
        public string? NivelEscolaridade { get; set; }
        public DateTime DataInscricao { get; set; }
    }
    public class PdfEnrollmentFormConfig
    {
        private readonly IConverter _converter;

        public PdfEnrollmentFormConfig(IConverter converter)
        {
            _converter = converter;
        }

        public byte[] GerarFichaInscricao(FichaInscricao ficha)
        {
            var html = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .input-line {{ border-bottom: 1px solid #000; padding: 2px 4px; display: inline-block; min-width: 100px; }}
                    .text-center {{ text-align: center; }}
                    .flex {{ display: flex; }}
                    .justify-end {{ justify-content: flex-end; }}
                    .justify-center {{ justify-content: center; }}
                    .retang {{ border: 1px solid #000; padding: 10px; margin-bottom: 10px; }}
                    .p-2 {{ padding: 8px; }}
                </style>
            </head>
            <body>
                <div class='w-full h-full overflow-auto'>
                    <div class='ficha-container'>
                        <header class='flex'>
                            <div>
                                <img src='images/marca.png' width='100' alt='Logo'>
                            </div>
                            <div class='w-full mb-4'>
                                <div>
                                    <h1>ENGLISH TRAINING CENTER</h1>
                                    <h2>FICHA DE INSCRIÇÃO PARA FORMAÇÃO</h2>
                                </div>
                            </div>
                        </header>

                        <section class='w-full h-full flex flex-col gap-1'>
                            <div class='retang'>
                                <h2>DADOS DO CURSO</h2>
                                <p class='text-center'>
                                    Curso: <span class='input-line'>{ficha.CursoPretendido}</span>,&nbsp;&nbsp;
                                    Pacote: <span class='input-line'>Regular</span>,&nbsp;&nbsp;
                                    Nível: <span class='input-line'>A1</span>,&nbsp;&nbsp;
                                    Modalidade: <span class='input-line'>Presencial</span>
                                </p>
                            </div>

                            <div class='retang'>
                                <h2>DOCUMENTO DE IDENTIFICAÇÃO</h2>
                                <p class='text-center'>
                                    Tipo: <span class='input-line'>BI</span>,&nbsp;&nbsp;
                                    Número: <span class='input-line'>{ficha.DocumentoIdentificacao}</span>
                                </p>
                            </div>

                            <div class='retang'>
                                <h2>DADOS PESSOAIS</h2>
                                <p class='text-center'>
                                    Nome Completo: <span class='input-line'>{ficha.NomeCompleto}</span>,&nbsp;&nbsp;
                                    Data de Nascimento: <span class='input-line'>{ficha.DataNascimento:dd/MM/yyyy}</span>,&nbsp;&nbsp;
                                    Gênero: <span class='input-line'>{ficha.Genero}</span>,&nbsp;&nbsp;
                                    Nacionalidade: <span class='input-line'>{ficha.Nacionalidade}</span>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </body>
            </html>
            ";

            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = new GlobalSettings
                {
                    PaperSize = PaperKind.A4,
                    Orientation = Orientation.Portrait
                },
                Objects = {
                    new ObjectSettings
                    {
                        HtmlContent = html,
                        WebSettings = { DefaultEncoding = "utf-8" }
                    }
                }
            };

            return _converter.Convert(doc);
        }
    }
}