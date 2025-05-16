/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IDocumentController
    {
        Task<IActionResult> PdfGenerateEnrollmentForm([FromBody] StudentEnrollmentFormModel ficha);
        Task<IActionResult> PngGenerateEnrollmentForm([FromBody] StudentEnrollmentFormModel ficha);
        Task<IActionResult> PdfGeneratePaymentReceipt([FromBody] StudentPaymentModel ficha);
        Task<IActionResult> PngGeneratePaymentReceipt([FromBody] StudentPaymentModel ficha);
    }
}