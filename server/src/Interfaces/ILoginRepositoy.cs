/*
*@author Ramadan Ismael
*/

using System.Security.Claims;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface ILoginRepositoy
    {
        Task<ResponseDto> SignIn(LoginDto loginDto);
        Task<ResponseDto> RefreshToken(TokenDto tokenDto);
        Task<ResponseDto> Logout(ClaimsPrincipal userPrincipal);
    }
}