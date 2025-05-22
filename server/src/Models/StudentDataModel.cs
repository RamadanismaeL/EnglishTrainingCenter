/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.Models
{
    public class StudentDataModel
    {
        public long Order { get; set; }
        [Key]
        public string Id { get; set; } = string.Empty;


        // IDENTIFICATION DOCUMENT
        public string DocumentType { get; set; } = string.Empty;
        public string IdNumber { get; set; } = string.Empty;
        public string PlaceOfIssue { get; set; } = string.Empty;
        public string ExpirationDate { get; set; } = string.Empty;


        // PERSONAL DATA
        public string FullName { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public DateTime DateOfBirthCalc { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string MaritalStatus { get; set; } = string.Empty;
        public string Nationality { get; set; } = string.Empty;
        public string PlaceOfBirth { get; set; } = string.Empty;
        public string ResidentialAddress { get; set; } = string.Empty;
        public string? FirstPhoneNumber { get; set; }
        public string? SecondPhoneNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? AdditionalNotes { get; set; }


        // EMERGENCY CONTACT / GUARDIAN
        public string? GuardFullName { get; set; }
        public string? GuardRelationship { get; set; }
        public string? GuardResidentialAddress { get; set; }
        public string? GuardFirstPhoneNumber { get; set; }
        public string? GuardSecondPhoneNumber { get; set; }
        public string? GuardEmailAddress { get; set; }


        public string Status { get; set; } = string.Empty; // Active, Inactive, Completed
        public string TrainerName { get; set; } = string.Empty;
        public DateTime DateUpdate { get; set; }


        public StudentEnrollmentFormModel? EnrollmentForm { get; set; }
        public ICollection<StudentCourseInfoModel>? CourseInfo { get; set; }
        public ICollection<StudentPaymentModel>? Payments { get; set; }
        public ICollection<StudentMonthlyTuitionModel>? MonthlyTuition { get; set; }
    }
}