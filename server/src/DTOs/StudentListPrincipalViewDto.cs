/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentListPrincipalViewDto
    {
        public long Order { get; set; }
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirthCalc { get; set; }
        public string Gender { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
    }
}