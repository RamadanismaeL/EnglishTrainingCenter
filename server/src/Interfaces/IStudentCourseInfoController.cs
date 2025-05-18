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
    }
}