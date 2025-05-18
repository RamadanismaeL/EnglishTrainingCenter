/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentController
    {
        Task<IActionResult> Create([FromBody] StudentCreateDto studentCreateDto);
        Task<ActionResult<List<StudentDataModel>>> DetailStudentData();
        Task<ActionResult<List<StudentEnrollmentFormModel>>> DetailStudentEnrollmentForm();
        Task<ActionResult<string>> GetStudentByLastId();
        Task<ActionResult<StudentEnrollmentFormModel>> GetStudentEnrollmentFormById(string id);
        Task<ActionResult<StudentDataModel>> GetStudentDataByName(string fullName);
    }
}