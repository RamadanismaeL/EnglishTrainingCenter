/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentMonthlyTuitionController
    {
        Task<IActionResult> Create([FromBody] StudentMonthlyTuitionCreateDto monthlyTuitionCreateDto);
        Task<ActionResult<IEnumerable<StudentMonthlyTuitionModel>>> GetAllMonthlyTuition();
        Task<IActionResult> Update(StudentMonthlyTuitionUpdateDto monthlyTuitionUpdateDto);
    }
}