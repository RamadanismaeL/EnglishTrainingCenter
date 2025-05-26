/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoUpdateQuizDto
    {
        public long Order { get; set; }

        public decimal QuizOne { get; set; }
        public decimal QuizTwo { get; set; }
        public decimal Exam { get; set; }
    }
}