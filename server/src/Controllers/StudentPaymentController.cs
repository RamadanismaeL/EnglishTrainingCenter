/*
*@author Ramadan Ismael
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
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentPaymentController : ControllerBase, IStudentPaymentController
    {
        private readonly IStudentPaymentRepository _paymentRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public StudentPaymentController(IStudentPaymentRepository paymentRepository, IHubContext<NotificationHub> hubContext)
        {
            _paymentRepository = paymentRepository;
            _hubContext = hubContext;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] StudentPaymentCreateDto paymentCreateDto)
        {
            if (paymentCreateDto == null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Student Payment data is required."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _paymentRepository.Create(paymentCreateDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Student Payment created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("details")]
        public async Task<ActionResult<List<StudentPaymentModel>>> Details()
        {
            var paymentData = await _paymentRepository.Details();
            return Ok(paymentData);
        }

        [HttpGet("getStudentPaymentByLastId")]
        public async Task<ActionResult<string>> GetStudentPaymentByLastId()
        {
            var studentLastId = await _paymentRepository.GetStudentPaymentByLastId();

            return Ok(studentLastId);
        }

        [HttpPost("detail-student-payment-by-id/{id}")]
        public async Task<ActionResult<StudentPaymentModel>> GetStudentPaymentById(string id)
        {
            var student = await _paymentRepository.GetStudentPaymentById(id);

            return Ok(student);
        }
    }
}