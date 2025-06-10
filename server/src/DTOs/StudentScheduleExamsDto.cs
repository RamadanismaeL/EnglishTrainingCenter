/*
*@author Ramadan Ismael 
*/

namespace server.src.DTOs
{
    public class StudentScheduleExamsDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;

        public decimal QuizOne { get; set; } = 0.0M;
        public decimal QuizTwo { get; set; } = 0.0M;
        public decimal Exam { get; set; } = 0.0M;
        public decimal FinalAverage { get; set; } = 0.0M;

        public string Status { get; set; } = string.Empty;
    }
}