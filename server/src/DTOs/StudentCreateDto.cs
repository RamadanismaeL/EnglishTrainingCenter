/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCreateDto
    {
        // COURSE INFORMATION
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;

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
        public string FirstPhoneNumber { get; set; } = string.Empty;
        public string SecondPhoneNumber { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public string AdditionalNotes { get; set; } = string.Empty;

        // EMERGENCY CONTACT / GUARDIAN
        public string GuardFullName { get; set; } = string.Empty;
        public string GuardRelationship { get; set; } = string.Empty;
        public string GuardResidentialAddress { get; set; } = string.Empty;
        public string GuardFirstPhoneNumber { get; set; } = string.Empty;
        public string GuardSecondPhoneNumber { get; set; } = string.Empty;
        public string GuardEmailAddress { get; set; } = string.Empty;
    }
}