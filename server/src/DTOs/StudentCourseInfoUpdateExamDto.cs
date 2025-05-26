/*
*@author: Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoUpdateExamDto
    {
        public long Order { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public decimal Exam { get; set; } = 0.0M;
    }
}