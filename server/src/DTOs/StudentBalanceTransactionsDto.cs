/*
* Copyright 2025 | Ramadan I.A Ismael
*/

namespace server.src.DTOs
{
    public class StudentBalanceTransactionsDto
    {
        public string StudentFullName { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public string DescriptionEnglish { get; set; } = string.Empty;
        public string ReceivedFrom { get; set; } = string.Empty;        
        public string Method { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime DateRegister { get; set; }
        public string TrainerName { get; set; } = string.Empty;
    }
}