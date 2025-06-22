/*
* Copyright 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class FinancialExpenseUpdateDto
    {
        public long Id { get;  set; }
        public string Description { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }
    }
}