/*
* Copyright 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class FinancialExpenseCreateDto
    {
        public string Description { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }        
        public DateTime LastUpdate { get; set; }
        public string TrainerName { get; set; } = string.Empty;
    }
}