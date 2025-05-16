/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.DTOs
{
    public class RoleUpdateDto
    {
        [Required]
        public string RoleName { get; set; } = null!;
    }
}