/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.src.Models
{
    public class StudentCourseInfoScheduleExamModel
    {
        [Key, ForeignKey("CourseInfo")]
        public string CourseInfoId { get; set; } = string.Empty;
        public StudentCourseInfoModel? CourseInfoData { get; set; }

        public string Status { get; set; } = string.Empty; // Scheduled, Unscheduled, Completed
        public bool IsScheduled { get; set; } = false;
        public DateTime? ScheduledDate { get; set; }       
    }
}