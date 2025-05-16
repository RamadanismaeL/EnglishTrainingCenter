/*
@auhtor: Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.src.Models
{
    public class StudentEnrollmentFormModel
    {
        [Key, ForeignKey("Student")]
        public string StudentId { get; set; } = string.Empty;
        public StudentDataModel? StudentData { get; set; } // Navigation property to StudentDataModel


        // COURSE INFORMATION
        public string CourseName { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public decimal MonthlyFee { get; set; }
        public int Age { get; set; }


        // Fees and Payment
        public decimal CourseFee { get; set; }
        public decimal Installments { get; set; }


        // Date
        public int Days { get; set; }
        public string Months { get; set; } = string.Empty;
        public int Years { get; set; }
        public DateTime Times { get; set; }
        public string TrainerName { get; set; } = string.Empty;
    }
}