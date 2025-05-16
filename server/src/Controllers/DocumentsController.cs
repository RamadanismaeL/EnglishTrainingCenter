/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController(IDocumentRepository docs) : ControllerBase, IDocumentController
    {
        private readonly IDocumentRepository _docs = docs;

        [HttpPost("Pdf-generate-enrollment-form")]
        public async Task<IActionResult> PdfGenerateEnrollmentForm([FromBody] StudentEnrollmentFormModel ficha)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Executa a geração do PDF em uma Task assíncrona
                byte[] pdfBytes = await Task.Run(() => _docs.PdfGenerateEnrollmentForm(ficha));

                // Adiciona o header para forçar o download
                Response.Headers.Append("Content-Disposition", "attachment; filename=FichaDeInscricao.pdf");

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating PDF: {ex.Message}");
            }
        }

        [HttpPost("Png-generate-enrollment-form")]
        public async Task<IActionResult> PngGenerateEnrollmentForm([FromBody] StudentEnrollmentFormModel ficha)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            byte[] imageBytes = await _docs.PngGenerateEnrollmentForm(ficha);

            // Retorna o arquivo PNG com o tipo MIME correto
            return File(imageBytes, "image/png", "FichaDeInscricao.png");
        }

        [HttpPost("Pdf-generate-payment-receipt")]
        public async Task<IActionResult> PdfGeneratePaymentReceipt([FromBody] StudentPaymentModel ficha)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Executa a geração do PDF em uma Task assíncrona
                byte[] pdfBytes = await Task.Run(() => _docs.PdfGeneratePaymentReceipt(ficha));

                // Adiciona o header para forçar o download
                Response.Headers.Append("Content-Disposition", "attachment; filename=ReciboDePagamento.pdf");

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating PDF: {ex.Message}");
            }
        }

        [HttpPost("Png-generate-payment-receipt")]
        public async Task<IActionResult> PngGeneratePaymentReceipt([FromBody] StudentPaymentModel ficha)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            byte[] imageBytes = await _docs.PngGeneratePaymentReceipt(ficha);

            // Retorna o arquivo PNG com o tipo MIME correto
            return File(imageBytes, "image/png", "ReciboDePagamento.png");
        }
    }
}