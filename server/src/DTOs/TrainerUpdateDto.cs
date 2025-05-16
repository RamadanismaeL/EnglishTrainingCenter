/*
*@auhtor Ramadan Ismael
*/

using server.src.Enums;

namespace server.src.DTOs
{
    public class TrainerUpdateDto
    {
        public string Id { get; set; } = string.Empty;
        public IFormFile? ProfileImage { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public TrainerStatusEnum Status { get; set; }        
        public List<string>? Roles { get; set; }
    }
}