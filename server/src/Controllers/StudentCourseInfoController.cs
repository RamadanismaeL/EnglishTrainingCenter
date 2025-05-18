/*
*@author Ramadan Ismael
*/

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
    public class StudentCourseInfoController(IStudentCourseInfoRepository courseInfoRepository, IHubContext<NotificationHub> hubContext) : ControllerBase, IStudentCourseInfoController
    {
        private readonly IStudentCourseInfoRepository _courseInfoRepository = courseInfoRepository;
        private readonly IHubContext<NotificationHub> _hubContext = hubContext;

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] StudentCourseInfoCreateDto studentCourseCreateDto)
        {
            if (studentCourseCreateDto is null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Student course data is required."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _courseInfoRepository.Create(studentCourseCreateDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Student Course created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("details")]
        public async Task<ActionResult<List<StudentCourseInfoModel>>> Details()
        {
            var courseData = await _courseInfoRepository.Details();
            return Ok(courseData);
        }
    }
}