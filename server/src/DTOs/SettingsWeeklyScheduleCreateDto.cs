/*
*@author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class SettingsWeeklyScheduleCreateDto
    {
        public string Monday { get; set; } = string.Empty;
        public string Tuesday { get; set; } = string.Empty;
        public string Wednesday { get; set; } = string.Empty;
        public string Thursday { get; set; } = string.Empty;
    }
}