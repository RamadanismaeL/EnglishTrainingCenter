/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Interfaces;

namespace server.src.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase, ILoginController
    {
        private readonly ILoginRepositoy _loginRepositoy;

        public LoginController(ILoginRepositoy loginRepositoy)
        {
            _loginRepositoy = loginRepositoy;
        }

        [AllowAnonymous]
        [HttpPost("sign-in")]
        public async Task<IActionResult> SignIn([FromBody] LoginDto loginDto)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _loginRepositoy.SignIn(loginDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenDto tokenDto)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _loginRepositoy.RefreshToken(tokenDto);

            if(!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    
        [HttpPost("logout")]
        public async Task<ActionResult<ResponseDto>> Logout()
        {
            var userPrincipal = HttpContext.User;

            var response = await _loginRepositoy.Logout(userPrincipal);
            if (!response.IsSuccess) return BadRequest(response);

            return Ok(response);
        }
    }
}