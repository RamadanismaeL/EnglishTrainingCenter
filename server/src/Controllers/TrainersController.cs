/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Signalr;

namespace server.src.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TrainersController : ControllerBase, ITrainerController
    {
        private readonly ITrainerRepository _trainerRepository;  
        private readonly IHubContext<NotificationHub> _hubContext;      

        public TrainersController(ITrainerRepository iTrainerRepository, IHubContext<NotificationHub> hubContext)
        {            
            _trainerRepository = iTrainerRepository;   
            _hubContext = hubContext;                    
        }
        
        [AllowAnonymous]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] TrainerCreateDto trainerCreateDto)
        {
            if (trainerCreateDto == null)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Trainer data is required."
                });
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.Create(trainerCreateDto);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Trainer created successfully."); 

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [AllowAnonymous]
        [HttpGet("details")]
        public async Task<ActionResult<IEnumerable<TrainerDetailsDto>>> Details()
        {
            var trainers = await _trainerRepository.Details();
            return Ok(trainers);
        }

        [AllowAnonymous]
        [HttpGet("any-details")]
        public async Task<IActionResult> AnyDetails()
        {
            var trainers = await _trainerRepository.AnyDetails();
            return Ok(trainers);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("details-subsidy")]
        public async Task<ActionResult<IEnumerable<TrainerDetailsSubsidyDto>>> DetailsSubsidy()
        {
            var trainers = await _trainerRepository.DetailsSubsidy();
            return Ok(trainers);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromForm] TrainerUpdateDto trainerUpdateDto)
        {
            if(trainerUpdateDto is null)
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Trainer data is request."
                });
            }
            
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.Update(trainerUpdateDto);
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Trainer updated successfully."); 

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPut("update-profile-picture")]
        public async Task<IActionResult> UpdateProfileImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "File is required."
                });
            }

            // Validar formato do arquivo (apenas imagens)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if(!allowedExtensions.Contains(extension))
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid file format. Only images are allowed."
                });
            }

            // Limitar tamanho do arquivo (exemplo: 2MB)
            const long maxSize = 2 * 1024 * 1024;
            if (file.Length > maxSize)
            {
                return BadRequest(new ResponseDto
                {
                    IsSuccess = false,
                    Message = "File size exceeds the limit of 2MB."
                });
            }

            var userPrincipal = HttpContext.User;

            var response = await _trainerRepository.UpdateProfileImage(userPrincipal, file);      

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Trainer profile photo updated.");      

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-subsidy")]
        public async Task<IActionResult> UpdateSubsidy([FromBody] TrainerUpdateSubsidyDto trainerUpdateSubsidyDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _trainerRepository.UpdateSubsidy(trainerUpdateSubsidyDto);

            if (!response.IsSuccess) return BadRequest(response);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Trainer Subsidy updated.");

            return Ok(response);
        }

        [HttpDelete("delete-profile-photo/{id}")]
        public async Task<IActionResult> DeleteProfileImage(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Trainer not found."
                });
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.DeleteProfileImage(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Profile photo deleted successfully."); 

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Trainer not found."
                });
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.Delete(id);
            
            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Trainer deleted successfully."); 

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }
    
        [HttpGet("detail")]
        public async Task<ActionResult<TrainerDetailsDto>> Detail()
        {
            // Obtém o trainer autenticado a partir do contexto da requisição
            var userPrincipal = HttpContext.User;
                
            // Chama o método Detail do Repositório
            var trainer = await _trainerRepository.Detail(userPrincipal);

            return Ok(trainer);
        }
    
        [AllowAnonymous]
        [HttpPost("validate-reset-code")]
        public async Task<IActionResult> ValidateResetCode(ValidateResetCodeDto validateResetCodeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.ValidateResetCode(validateResetCodeDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    
        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(TrainerForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.ForgotPassword(forgotPasswordDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("send-new-code")]
        public async Task<IActionResult> SendNewCode(TrainerSendNewCodeDto sendNewCodeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _trainerRepository.SendNewCode(sendNewCodeDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    
        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(TrainerResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _trainerRepository.ResetPassword(resetPasswordDto);

            if (!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword (TrainerChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _trainerRepository.ChangePassword(changePasswordDto);

            if (!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    }
}