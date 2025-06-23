/*
* Copyrigth 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class FinancialDailyReportTransactionListDto
    {
        public decimal BankRevenue { get; set; }
        public decimal BankExpense { get; set; }
        public decimal BankFinalBalance { get; set; }

        public decimal CashRevenue { get; set; }
        public decimal CashExpense { get; set; }
        public decimal CashFinalBalance { get; set; }

        public decimal EMolaRevenue { get; set; }
        public decimal EMolaExpense { get; set; }
        public decimal EMolaFinalBalance { get; set; }

        public decimal MPesaRevenue { get; set; }
        public decimal MPesaExpense { get; set; }
        public decimal MPesaFinalBalance { get; set; }

        public decimal TotalRevenue { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal TotalFinalBalance { get; set; }
    }
}