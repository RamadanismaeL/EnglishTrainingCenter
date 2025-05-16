/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentPaymentController
    {
        Task<IActionResult> Create([FromBody] StudentPaymentCreateDto paymentCreateDto);
        Task<ActionResult<List<StudentPaymentModel>>> Details();
        Task<ActionResult<string>> GetStudentPaymentByLastId();
        Task<ActionResult<StudentPaymentModel>> GetStudentPaymentById(string id);
    }
}