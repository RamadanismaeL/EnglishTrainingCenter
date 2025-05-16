/*
*@author Ramadan Ismael
*/

using server.src.Models;

namespace server.src.Interfaces
{
    public interface IDocumentRepository
    {
        byte[] PdfGenerateEnrollmentForm(StudentEnrollmentFormModel ficha);
        Task<byte[]> PngGenerateEnrollmentForm(StudentEnrollmentFormModel ficha);
        byte[] PdfGeneratePaymentReceipt(StudentPaymentModel ficha);
        Task<byte[]> PngGeneratePaymentReceipt(StudentPaymentModel ficha);       
    }
}