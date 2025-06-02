/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.src.Models
{
    public class StudentCourseInfoScheduleExamModel
    {
        [Key, ForeignKey("CourseInfoIdScheduledExam")]
        public string CourseInfoId { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty; // Schedule, Unschedule, Completed
        public DateTime? ScheduledDate { get; set; }
        
        public StudentCourseInfoModel? CourseInfoData { get; set; }
    }
}