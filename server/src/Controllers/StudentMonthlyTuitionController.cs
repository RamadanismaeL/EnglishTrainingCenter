/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;
using server.src.Signalr;

namespace server.src.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentMonthlyTuitionController(IStudentMonthlyTuitionRepository studentMonthlyTuitionRepository, IHubContext<NotificationHub> hubContext) : ControllerBase, IStudentMonthlyTuitionController
    {
        private readonly IStudentMonthlyTuitionRepository _studentMonthlyTuitionRepository = studentMonthlyTuitionRepository;
        private readonly IHubContext<NotificationHub> _hubContext = hubContext;

        [HttpPost("create/{studentID}")]
        public async Task<IActionResult> Create([FromRoute] string studentID)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _studentMonthlyTuitionRepository.Create(studentID);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Monthly tuition created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-all-monthly-tuition")]
        public async Task<ActionResult<IEnumerable<StudentMonthlyTuitionModel>>> GetAllMonthlyTuition()
        {
            var listStudent = await _studentMonthlyTuitionRepository.GetAllMonthlyTuition();

            return Ok(listStudent);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(StudentMonthlyTuitionUpdateDto monthlyTuitionUpdateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _studentMonthlyTuitionRepository.Update(monthlyTuitionUpdateDto);
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Monthly tuition updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("status-monthly-tuition/{order}/{status}")]
        public async Task<IActionResult> UpdateStatusMonthly([FromRoute] long order, string status)
        {
            if (order <= 0)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid order number."
                });
            }

            var response = await _studentMonthlyTuitionRepository.UpdateStatusMonthly(order, status);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Status cancelled successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-monthly-tuition-payment-list")]
        public async Task<ActionResult<List<MonthlyTuitionPaymentListDto>>> GetMonthlyTuitionPaymentList()
        {
            var monthlyTuition = await _studentMonthlyTuitionRepository.GetMonthlyTuitionPaymentList();
            return Ok(monthlyTuition);
        }
    }
}