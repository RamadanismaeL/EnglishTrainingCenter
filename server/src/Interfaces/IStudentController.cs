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
        Task<IActionResult> Update([FromBody] StudentUpdateDto studentUpdateDto);
        Task<IActionResult> UpdateStatus([FromRoute] string status, [FromBody] List<long> order);        
        Task<ActionResult<List<StudentDataModel>>> DetailStudentData();
        Task<ActionResult<List<StudentEnrollmentFormModel>>> DetailStudentEnrollmentForm();
        Task<ActionResult<string>> GetStudentByLastId();
        Task<ActionResult> GetStudentCourseFeeByLastId();
        Task<ActionResult<IEnumerable<StudentCourseFeeModel>>> GetStudentListCourseFee();
        Task<ActionResult<StudentEnrollmentFormModel>> GetStudentEnrollmentFormById(string id);
        Task<ActionResult<StudentDataModel>> GetStudentDataByName(string fullName);
        Task<ActionResult<StudentUpdateDto>> GetStudentListProfileEditById(string id);
        Task<ActionResult<StudentListProfileDto>> GetStudentListProfileById(string id);
        Task<ActionResult<StudentListProfileEnrollmentDto>> GetStudentListProfileEnrollmentById(string id);
        Task<ActionResult<IEnumerable<ListStudentActiveDto>>> GetListStudentActive();
        Task<ActionResult<IEnumerable<ListStudentActiveDto>>> GetListStudentCompleted();
        Task<ActionResult<IEnumerable<ListStudentActiveDto>>> GetListStudentInactive();
    }
}