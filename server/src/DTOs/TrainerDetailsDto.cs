/*
*@author Ramadan Ismael
*/

using server.src.Enums;

namespace server.src.DTOs
{
    public class TrainerDetailsDto
    {
        public string? ProfileImage { get; set; }
        public string Id { get; set; } = string.Empty;
        public string? FullName { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; } = string.Empty;
        public string? Position { get; set; }
        public TrainerStatusEnum Status { get; set; }
        
        public string[]? Roles { get; set; }
        public DateTime DateRegister { get; set; }        
    }
}