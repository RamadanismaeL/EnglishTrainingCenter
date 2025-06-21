/*
* Copyrigth 2025 | Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentFinancialSummaryListDto
    {
        public decimal CourseFeeTotal { get; set; }
        public decimal CourseFeePaid { get; set; }
        public decimal CourseFeeDue { get; set; }
        public string CourseFeeDateUpdate { get; set; } = string.Empty;
        public decimal Certificate { get; set; }
        public decimal Enrollment { get; set; }
        public decimal Examination { get; set; }
        public decimal Tuition { get; set; }
        public decimal TotalIncome { get; set; }
    }
}