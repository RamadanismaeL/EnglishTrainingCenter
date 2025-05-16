/*
* @author Ramadan Ismael
*/

namespace server.src.Models
{
    public class StudentMonthlyTuitionModel
    {
        public string Id { get; set; } = string.Empty; // MonthYearStudentId (M042025ETC20250401)
        public string StudentId { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public decimal ExpectedAmountMT { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime? ReferenceMonthDate { get; set; }
        public DateTime? DueDate { get; set; } // Após a data de vencimento os alunos serão suspensos
        public string Status { get; set; } = string.Empty; // Cancelled, NotPaid, Paid, Pending
    }
}