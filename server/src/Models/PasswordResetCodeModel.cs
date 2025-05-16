/*
*@author Ramadan Ismael
*/

namespace server.src.Models
{
    public class PasswordResetCodeModel
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}