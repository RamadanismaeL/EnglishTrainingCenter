/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentCourseInfoController
    {
        Task<IActionResult> Create([FromBody] StudentCourseInfoCreateDto studentCourseCreateDto);
        Task<IActionResult> Update([FromBody] StudentCourseInfoUpdateDto studentCourseUpdateDto);
        Task<ActionResult<StudentCourseInfoUpdateListDto>> GetStudentCourseInfoUpdateListById(string id);
        Task<ActionResult<List<StudentCourseInfoModel>>> Details();
        Task<IActionResult> UpdateQuiz([FromBody] StudentCourseInfoUpdateQuizDto courseInfoUpdateQuizDto);
        Task<IActionResult> UpdateQuizOneTwo([FromBody] StudentCourseInfoUpdateQuizOneTwoDto courseInfoUpdateQuizDto);
        Task<IActionResult> CancelStatus([FromRoute] long order);
        Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoActive();
        Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoCompleted();
        Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoInactive();
        Task<ActionResult<List<StudentCourseInfoProgressHistoryDto>>> GetListStudentCourseInfoProgressHistory(string studentId);
        Task<ActionResult<List<StudentUnscheduledExamsDto>>> GetListStudentUnscheduledExams();
        Task<IActionResult> UpdateStudentUnScheduledExams([FromBody] List<string>? IdScheduleExam);
        Task<ActionResult<List<StudentScheduleExamsDto>>> GetListStudentScheduledExams();
    }
}