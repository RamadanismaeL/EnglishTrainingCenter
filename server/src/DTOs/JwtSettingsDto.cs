/*
*@auhtor Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class JwtSettingsDTOs
    {
        public string? ValidAudience { get; set; }
        public string? ValidIssuer { get; set; }
        public string? SecurityKey { get; set; }
        public string? ExpiryTime { get; set; }
    }
}