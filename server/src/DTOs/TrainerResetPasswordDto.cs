/*
*@auhtor Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.DTOs
{
    public class TrainerResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}