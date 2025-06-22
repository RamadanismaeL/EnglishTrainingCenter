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
    public class SettingsController : ControllerBase, ISettingsController
    {
        private readonly ISettingRepository _settingRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public SettingsController(ISettingRepository settingsRepository, IHubContext<NotificationHub> hubContext)
        {
            _settingRepository = settingsRepository;
            _hubContext = hubContext;
        }

        [AllowAnonymous]
        [HttpPost("create-academic-year")]
        public async Task<IActionResult> CreateAcademicYear()
        {
            var response = await _settingRepository.CreateAcademicYear();

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("details-academic-year")]
        public async Task<ActionResult<List<SettingsAcademicYearModel>>> DetailsAcademicYear()
        {
            var academicYear = await _settingRepository.DetailsAcademicYear();
            return Ok(academicYear);
        }
    
        [HttpPatch("update-academic-year")]
        public async Task<IActionResult> UpdateAcademicYear(SettingsAcademicYearModel settingsAcademicYear)
        {
            if (settingsAcademicYear is null) 
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Academic year data is required."
                });
            }

            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.UpdateAcademicYear(settingsAcademicYear);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("delete-academic-year/{id}")]
        public async Task<IActionResult> DeleteAcademicYear(int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

             var response = await _settingRepository.DeleteAcademicYear(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Deleted successfully."); 

            return response.IsSuccess ? Ok(response) : NotFound(response);
        }


        // AmountMt
        [AllowAnonymous]
        [HttpPost("create-amount-mt")]
        public async Task<IActionResult> CreateAmountMt()
        {
            var response = await _settingRepository.CreateAmountMt();

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("details-amount-mt")]
        public async Task<ActionResult<List<SettingsAmountMtModel>>> DetailsAmountMt()
        {
            var amountMt = await _settingRepository.DetailsAmountMt();
            return Ok(amountMt);
        }

        [HttpPatch("update-amount-mt")]
        public async Task<IActionResult> UpdateAmountMt(SettingsAmountMtModel settingsAmountMt)
        {
            if (settingsAmountMt is null) 
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "AmountMt data is required."
                });
            }

            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.UpdateAmountMt(settingsAmountMt);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("delete-amount-mt/{id}")]
        public async Task<IActionResult> DeleteAmountMt(string id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

             var response = await _settingRepository.DeleteAmountMt(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Deleted successfully."); 

            return response.IsSuccess ? Ok(response) : NotFound(response);
        }


        // Monthly Tuition
        [AllowAnonymous]
        [HttpPost("create-monthly")]
        public async Task<IActionResult> CreateMonthlyTuition()
        {
            var response = await _settingRepository.CreateMonthlyTuition();

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("details-monthly")]
        public async Task<ActionResult<List<SettingsMonthlyTuitionModel>>> DetailsMonthlyTuition()
        {
            var monthlyTuition = await _settingRepository.DetailsMonthlyTuition();
            return Ok(monthlyTuition);
        }

        [HttpPatch("update-monthly")]
        public async Task<IActionResult> UpdateMonthlyTuition(SettingsMonthlyTuitionModel settingsMonthlyTuition)
        {
            if (settingsMonthlyTuition is null) 
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Monthly Tuition data is required."
                });
            }

            var response = await _settingRepository.UpdateMonthlyTuition(settingsMonthlyTuition);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("delete-monthly/{id}")]
        public async Task<IActionResult> DeleteMonthlyTuition(string id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

             var response = await _settingRepository.DeleteMonthlyTuition(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Deleted successfully."); 

            return response.IsSuccess ? Ok(response) : NotFound(response);
        }


        // WeeklySchedule
        [AllowAnonymous]
        [HttpPost("create-weekly-schedule")]
        public async Task<IActionResult> CreateWeeklySchedule(SettingsWeeklyScheduleCreateDto settingsWeeklySchedule)
        {
            if (settingsWeeklySchedule is null) 
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Weekly Schedule data is required."
                });
            }

            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.CreateWeeklySchedule(settingsWeeklySchedule);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Created successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }
        
        [HttpGet("details-weekly-schedule")]
        public async Task<ActionResult<List<SettingsWeeklyScheduleModel>>> DetailsWeeklySchedule()
        {
            var weeklySchedule = await _settingRepository.DetailsWeeklySchedule();
            return Ok(weeklySchedule);
        }

        [HttpPatch("update-weekly-schedule")]
        public async Task<IActionResult> UpdateWeeklySchedule(SettingsWeeklyScheduleModel settingsWeeklySchedule)
        {
            if (settingsWeeklySchedule is null) 
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Weekly Schedule data is required."
                });
            }

            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.UpdateWeeklySchedule(settingsWeeklySchedule);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Updated successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }
        
        [HttpDelete("delete-weekly-schedule/{id}")]
        public async Task<IActionResult> DeleteWeeklySchedule(int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

             var response = await _settingRepository.DeleteWeeklySchedule(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Deleted successfully."); 

            return response.IsSuccess ? Ok(response) : NotFound(response);
        }

        // Get
        [HttpPost("get-monthly-by-id")]
        public async Task<ActionResult<decimal>> GetSettingsMonthlyTuition(string id, string packageName)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.GetSettingsMonthlyTuition(id, packageName);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Monthly Tuition.");

            return Ok(response);
        }

        [HttpPost("get-amount")]
        public async Task<ActionResult<decimal>> GetAmount(string id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _settingRepository.GetAmount(id);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Amount Success.");

            return Ok(response);
        }
    }
}