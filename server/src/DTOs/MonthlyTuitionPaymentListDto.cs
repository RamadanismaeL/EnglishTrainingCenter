/*
*@author Ramadan Ismael
*/

using System.Globalization;

namespace server.src.DTOs
{
    public class MonthlyTuitionPaymentListDto
    {
        public long OrderMonthlyTuition { get; set; }
        public string StudentID { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public decimal Amount { get; set; } = 0.0M;
        public string AmountFormatted => Amount.ToString("N2", CultureInfo.GetCultureInfo("pt-BR"));
        public string Description { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string DueDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Cancelled, Pending, Paid, Overdue
    }
}