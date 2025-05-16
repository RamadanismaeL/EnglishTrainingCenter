/*
*@auhtor Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Signalr;
using server.src.Interfaces;

namespace server.src.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase, IRoleController
    {
        private readonly IRoleRepository _roleRepository;

        public RolesController(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        [AllowAnonymous]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] RoleCreateDto roleCreateDto)
        {
            if(string.IsNullOrEmpty(roleCreateDto.RoleName))
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Role name is required."
                });
            }
            
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _roleRepository.Create(roleCreateDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }

        [HttpGet("details")]
        public async Task<ActionResult<IEnumerable<RoleDetailDto>>> Details()
        {
            var roles = await _roleRepository.Details();

            return Ok(roles);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update(string id, [FromBody] RoleUpdateDto roleUpdateDto)
        {
            if(string.IsNullOrEmpty(roleUpdateDto.RoleName))
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Role name is required."
                });
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _roleRepository.Update(roleUpdateDto, id);
            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(new ResponseDto {
                    IsSuccess = false,
                    Message = "Role not found"
                });
            }

            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _roleRepository.Delete(id);

            if(!response.IsSuccess) return BadRequest(response);

            //await _hubContext.Clients.All.SendAsync(CNotificationHub.receiveMsg, $"Role {id} deleted!");

            return Ok(response);
        }
    
        [HttpPost("assign")]
        public async Task<IActionResult> Assign([FromBody] RoleAssignDto roleAssignDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _roleRepository.Assign(roleAssignDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    }
}