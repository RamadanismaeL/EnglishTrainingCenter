/*
* Copyrigth 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class FinancialDailyReportBalanceDto
    {
        public decimal InitialBalance { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal Profit { get; set; }
        public decimal TotalBalance { get; set; }
    }
}