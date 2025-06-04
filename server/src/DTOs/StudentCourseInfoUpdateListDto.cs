/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentCourseInfoUpdateListDto
    {
        public string Package { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string AcademicPeriod { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty;
    }
}