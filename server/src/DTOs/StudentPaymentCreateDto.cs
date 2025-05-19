/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentPaymentCreateDto
    {
        public string StudentId { get; set; } = string.Empty;
        public string ReceivedFrom { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty; // Certificate, Enrollment, Examination, Tuition  
        public string Description { get; set; } = string.Empty; // Inscrição, Mensalidade de Abril,...
        public string Method { get; set; } = string.Empty; // Banco, E-Mola, M-Pesa,...
        public int AmountMT { get; set; }
    }
}