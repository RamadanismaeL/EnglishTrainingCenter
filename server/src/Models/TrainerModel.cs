/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Identity;
using server.src.Enums;

namespace server.src.Models
{
    public class TrainerModel : IdentityUser
    {
        public string? FullName { get; set; }
        public string? Position { get; set; }
        public TrainerStatusEnum Status { get; set; }
        public decimal SubsidyMT { get; set; }
        public string? ProfileImage { get; set; }
        public DateTime DateRegister { get; set; }
        public DateTime? DateUpdate { get; set; }
        //Implementando JWT Refresh Token
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

        public ICollection<StudentPaymentModel>? Payments { get; set; }
    }
}