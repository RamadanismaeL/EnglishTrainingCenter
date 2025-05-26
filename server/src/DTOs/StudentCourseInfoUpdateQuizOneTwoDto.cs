/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoUpdateQuizOneTwoDto
    {
        public long Order { get; set; }
        public decimal QuizOne { get; set; } = 0.0M;
        public decimal QuizTwo { get; set; } = 0.0M;
    }
}