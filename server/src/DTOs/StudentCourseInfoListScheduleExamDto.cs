/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoListScheduleExamDto
    {
        public List<string>? Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;

        public decimal QuizOne { get; set; } = 0.0M;
        public decimal QuizTwo { get; set; } = 0.0M;

        public string Status { get; set; } = string.Empty; // Schedule, Unschedule, Completed
        public string ScheduledDate { get; set; }  = string.Empty;
    }
}