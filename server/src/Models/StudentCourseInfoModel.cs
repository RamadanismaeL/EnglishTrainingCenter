/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.Models
{
    public class StudentCourseInfoModel
    {
        public long Order { get; set; }
        [Key]
        public string Id { get; set; } = string.Empty; // Course ID - A12025401    

        // COURSE INFORMATION
        public string CourseName { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public decimal MonthlyFee { get; set; }

        public decimal QuizOne { get; set; } = 0.0M;
        public decimal QuizTwo { get; set; } = 0.0M;
        public decimal Exam { get; set; } = 0.0M;
        public decimal FinalAverage { get; set; }


        public string Status { get; set; } = string.Empty; // Failed, Pass, In Progress
        public string TrainerName { get; set; } = string.Empty;
        public DateTime? DateUpdate { get; set; }
        public DateTime DateRegister { get; set; }

        public string StudentId { get; set; } = string.Empty;
        public StudentDataModel? StudentData { get; set; } // Navigation property to StudentDataModel
        public ICollection<StudentMonthlyTuitionModel>? MonthlyTuition { get; set; }
    }
}