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
    public class StudentsController : ControllerBase, IStudentController
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public StudentsController(IStudentRepository studentRepository, IHubContext<NotificationHub> hubContext)
        {
            _studentRepository = studentRepository;
            _hubContext = hubContext;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] StudentCreateDto studentCreateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _studentRepository.Create(studentCreateDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Student created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("detail-student-data")]
        public async Task<ActionResult<List<StudentDataModel>>> DetailStudentData()
        {
            var listStudent = await _studentRepository.DetailStudentData();

            return Ok(listStudent);
        }

        [HttpGet("detail-student-enrollment-form")]
        public async Task<ActionResult<List<StudentEnrollmentFormModel>>> DetailStudentEnrollmentForm()
        {
            var listStudent = await _studentRepository.DetailStudentEnrollmentForm();

            return Ok(listStudent);
        }

        [HttpGet("getStudentById")]
        public async Task<ActionResult<string>> GetStudentByLastId()
        {
            var studentLastId = await _studentRepository.GetStudentByLastId();

            return Ok(studentLastId);
        }

        [HttpGet("getCourseFeeById")]
        public async Task<ActionResult> GetStudentCourseFeeByLastId()
        {
            var studentLastId = await _studentRepository.GetStudentCourseFeeByLastId();

            return Ok(studentLastId);
        }

        [HttpGet("get-student-list-course-fee")]
        public async Task<ActionResult<IEnumerable<StudentCourseFeeModel>>> GetStudentListCourseFee()
        {
            var student = await _studentRepository.GetStudentListCourseFee();

            return Ok(student);
        }

        [HttpPost("detail-student-enrollment-form-by-id/{id}")]
        public async Task<ActionResult<StudentEnrollmentFormModel>> GetStudentEnrollmentFormById(string id)
        {
            var student = await _studentRepository.GetStudentEnrollmentFormById(id);

            return Ok(student);
        }

        [HttpPost("detail-student-data-by-fullName/{fullName}")]
        public async Task<ActionResult<StudentDataModel>> GetStudentDataByName(string fullName)
        {
            var student = await _studentRepository.GetStudentDataByName(fullName);

            return Ok(student);
        }
        
        [HttpGet("get-student-list-principal-view-active")]
        public async  Task<ActionResult<IEnumerable<StudentListPrincipalViewDto>>> GetStudentListPrincipalViewActive()
        {
            var student = await _studentRepository.GetStudentListPrincipalViewActive();

            return Ok(student);
        }
    }
}