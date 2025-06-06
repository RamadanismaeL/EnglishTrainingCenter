/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoUpdateQuizDto
    {
        public long Order { get; set; }

        public decimal QuizOne { get; set; } = 0.0M;
        public decimal QuizTwo { get; set; } = 0.0M;
        public decimal Exam { get; set; } = 0.0M;
    }
}