/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.src.Models
{
    public class StudentCourseInfoModel
    {
        [Key, ForeignKey("StudentData")]
        public string StudentId { get; set; } = string.Empty;          

        // COURSE INFORMATION
        public string CourseName { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public decimal MonthlyFee { get; set; }


        public string Status { get; set; } = string.Empty; // Active, Inactive, Completed, and Dropped
        public string TrainerName { get; set; } = string.Empty;
        public DateTime DateUpdate { get; set; }

        public StudentDataModel? StudentData { get; set; } // Navigation property to StudentDataModel
    }
}