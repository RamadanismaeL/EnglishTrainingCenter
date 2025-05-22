using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;
using server.src.Signalr;

namespace server.src.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentMonthlyTuitionController(IStudentMonthlyTuitionRepository studentMonthlyTuitionRepository, IHubContext<NotificationHub> hubContext) : ControllerBase, IStudentMonthlyTuitionController
    {
        private readonly IStudentMonthlyTuitionRepository _studentMonthlyTuitionRepository = studentMonthlyTuitionRepository;
        private readonly IHubContext<NotificationHub> _hubContext = hubContext;

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] StudentMonthlyTuitionCreateDto monthlyTuitionCreateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _studentMonthlyTuitionRepository.Create(monthlyTuitionCreateDto);

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
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _studentMonthlyTuitionRepository.Update(monthlyTuitionUpdateDto);
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Monthly tuition updated successfully."); 

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }
    }
}