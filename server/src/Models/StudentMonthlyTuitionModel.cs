/*
* @author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.Models
{
    public class StudentMonthlyTuitionModel
    {
        public long Order { get; set; }
        [Key]
        public string Id { get; set; } = string.Empty; // MMYYYY-Order
        public string Description { get; set; } = string.Empty;
        public DateTime? ReferenceMonthDate { get; set; } // = new DateTime(2023, 5, 1)
        public DateTime? DueDate { get; set; } // Após a data de vencimento os alunos serão suspensos
        // DueDate = new DateTime(2023, 5, 10),
        public string Status { get; set; } = string.Empty; // Cancelled, Not Paid, Paid, Overdue
        public string TrainerName { get; set; } = string.Empty;
        public DateTime? DateRegister { get; set; }
        public DateTime? DateUpdate { get; set; }
        
        public string StudentId { get; set; } = string.Empty;
        public StudentDataModel? StudentData { get; set; }

        // Relacionamento com CourseInfo (opcional)
        public string CourseInfoId { get; set; } = string.Empty;
        public StudentCourseInfoModel? CourseInfoData { get; set; }
        public string? PaymentId { get; set; }
        public StudentPaymentModel? PaymentData { get; set; }
    }
}