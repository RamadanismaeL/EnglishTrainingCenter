/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.DTOs
{
    public class RoleCreateDto
    {
        [Required]
        public string RoleName { get; set; } = null!;
    }
}