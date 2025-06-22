/*
* Copyright 2025 | Ramadan Ismael
*/

using System.Globalization;

namespace server.src.DTOs
{
    public class FinancialExpenseListDto
    {
        public long Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }
        public string AmountMTFormatted => AmountMT.ToString("N2", CultureInfo.GetCultureInfo("pt-BR"));        
        public DateTime LastUpdate { get; set; }
        public string Status { get; set; } = string.Empty; //Approved, Cancelled
        public string TrainerName { get; set; } = string.Empty;
    }
}