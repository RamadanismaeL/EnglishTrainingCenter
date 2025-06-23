/*
* Copyright 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class FinancialExpenseCreatePendingDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }
    }
}