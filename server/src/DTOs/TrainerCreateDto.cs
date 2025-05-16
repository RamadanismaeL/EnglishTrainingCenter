/*
*@author Ramadan Ismael
*/

using server.src.Enums;

namespace server.src.DTOs
{
    public class TrainerCreateDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public TrainerStatusEnum Status { get; set; }
        public IFormFile? ProfileImage { get; set; }
        public string Password { get; set; } = string.Empty;
        
        public List<string>? Roles { get; set; }
    }
}