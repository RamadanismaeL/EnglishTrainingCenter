/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface ILoginController
    {
        Task<IActionResult> SignIn([FromBody] LoginDto loginDto);
        Task<IActionResult> RefreshToken([FromBody] TokenDto tokenDto);
        Task<ActionResult<ResponseDto>> Logout();
    }
}