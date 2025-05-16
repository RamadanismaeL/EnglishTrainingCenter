/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class TrainerChangePasswordDto
    {
        public string? Email { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}