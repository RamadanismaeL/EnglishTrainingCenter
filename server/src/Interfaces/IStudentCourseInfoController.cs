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
        Task<ActionResult<List<StudentCourseInfoModel>>> Details();
        Task<IActionResult> UpdateQuiz([FromBody] StudentCourseInfoUpdateQuizDto courseInfoUpdateQuizDto);
        Task<IActionResult> UpdateQuizOneTwo([FromBody] StudentCourseInfoUpdateQuizOneTwoDto courseInfoUpdateQuizDto);
        Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoActive();
        Task<ActionResult<List<StudentCourseInfoProgressHistoryDto>>> GetListStudentCourseInfoProgressHistory(string studentId);
    }
}