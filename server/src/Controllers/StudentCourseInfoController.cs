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

        [HttpPatch("update")]
        public async Task<IActionResult> Update([FromBody] StudentCourseInfoUpdateDto studentCourseUpdateDto)
        {
            if (studentCourseUpdateDto is null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Student course data is required."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _courseInfoRepository.Update(studentCourseUpdateDto);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Student Course updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPost("get-student-course-info-update-list-by-id/{studentId}")]
        public async Task<ActionResult<StudentCourseInfoUpdateListDto>> GetStudentCourseInfoUpdateListById(string studentId)
        {
            var student = await _courseInfoRepository.GetStudentCourseInfoUpdateListById(studentId);

            return Ok(student);
        }

        [HttpGet("details")]
        public async Task<ActionResult<List<StudentCourseInfoModel>>> Details()
        {
            var courseData = await _courseInfoRepository.Details();
            return Ok(courseData);
        }

        [HttpPatch("update-quiz")]
        public async Task<IActionResult> UpdateQuiz([FromBody] StudentCourseInfoUpdateQuizDto courseInfoUpdateQuizDto)
        {
            if (courseInfoUpdateQuizDto is null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Course data is request."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _courseInfoRepository.UpdateQuiz(courseInfoUpdateQuizDto);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Course updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("update-quiz-one-two")]
        public async Task<IActionResult> UpdateQuizOneTwo([FromBody] StudentCourseInfoUpdateQuizOneTwoDto courseInfoUpdateQuizDto)
        {
            if (courseInfoUpdateQuizDto is null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Course data is request."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _courseInfoRepository.UpdateQuizOneTwo(courseInfoUpdateQuizDto);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Course updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("cancel-status/{order}")]
        public async Task<IActionResult> CancelStatus([FromRoute] long order)
        {
            if (order <= 0)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid order number."
                });
            }

            var response = await _courseInfoRepository.CancelStatus(order);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Status cancelled successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-list-student-course-info-active")]
        public async Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoActive()
        {
            var courseData = await _courseInfoRepository.GetListStudentCourseInfoActive();
            return Ok(courseData);
        }

        [HttpGet("get-list-student-course-info-completed")]
        public async Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoCompleted()
        {
            var courseData = await _courseInfoRepository.GetListStudentCourseInfoCompleted();
            return Ok(courseData);
        }

        [HttpGet("get-list-student-course-info-inactive")]
        public async Task<ActionResult<List<StudentCourseInfoListDto>>> GetListStudentCourseInfoInactive()
        {
            var courseData = await _courseInfoRepository.GetListStudentCourseInfoInactive();
            return Ok(courseData);
        }

        [HttpPost("get-list-student-course-info-progress-history-by-studentId/{studentId}")]
        public async Task<ActionResult<List<StudentCourseInfoProgressHistoryDto>>> GetListStudentCourseInfoProgressHistory(string studentId)
        {
            if (studentId == null || studentId.Trim().Length == 0)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid student ID."
                });
            }

            var courseData = await _courseInfoRepository.GetListStudentCourseInfoProgressHistory(studentId);
            return Ok(courseData);
        }

        [HttpGet("get-list-student-unscheduled-exams")]
        public async Task<ActionResult<List<StudentUnscheduledExamsDto>>> GetListStudentUnscheduledExams()
        {
            var unscheduledExams = await _courseInfoRepository.GetListStudentUnscheduledExams();
            return Ok(unscheduledExams);
        }

        [HttpPatch("update-student-unscheduled-exams")]
        public async Task<IActionResult> UpdateStudentUnScheduledExams([FromBody] List<string>? IdScheduleExam)
        {
            if (IdScheduleExam is null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Student unscheduled exam data is required."
                });
            }

            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _courseInfoRepository.UpdateStudentUnScheduledExams(IdScheduleExam);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Unscheduled exam updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-list-student-scheduled-exams")]
        public async Task<ActionResult<List<StudentScheduleExamsDto>>> GetListStudentScheduledExams()
        {
            var scheduledExams = await _courseInfoRepository.GetListStudentScheduledExams();
            return Ok(scheduledExams);
        }

        [HttpPatch("update-student-scheduled-exams/{Id}/{exam}")]
        public async Task<IActionResult> UpdateStudentScheduledExams([FromRoute] string Id, decimal exam)
        {
            if (string.IsNullOrEmpty(Id) || exam < 0)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid exam data."
                });
            }

            var response = await _courseInfoRepository.UpdateStudentScheduledExams(Id, exam);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Scheduled exam updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("cancel-student-scheduled-exams/{Id}")]
        public async Task<IActionResult> CancelStudentScheduledExams([FromRoute] string Id)
        {
            if (string.IsNullOrEmpty(Id))
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid ID."
                });
            }

            var response = await _courseInfoRepository.CancelStudentScheduledExams(Id);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Scheduled exam cancelled successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }
    }
}