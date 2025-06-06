/*
*@author Ramadan Ismael 
*/

namespace server.src.DTOs
{
    public class StudentUnscheduledExamsDto
    {
        public string IdScheduleExam { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Schedule, Unschedule, Completed
    }
}