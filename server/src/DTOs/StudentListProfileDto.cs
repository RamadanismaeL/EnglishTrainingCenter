/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentListProfileDto
    {
        // COURSE INFO
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public decimal MonthlyFee { get; set; }

        
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
    }
}