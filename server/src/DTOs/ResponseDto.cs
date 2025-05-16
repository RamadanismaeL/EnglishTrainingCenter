/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class ResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}