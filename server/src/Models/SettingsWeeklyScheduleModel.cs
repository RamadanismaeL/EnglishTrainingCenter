/*
* @author Ramadan Ismael
*/

namespace server.src.Models
{
    public class SettingsWeeklyScheduleModel
    {
        public int Id { get; set; }
        public string Monday { get; set; } = string.Empty;
        public string Tuesday { get; set; } = string.Empty;
        public string Wednesday { get; set; } = string.Empty;
        public string Thursday { get; set; } = string.Empty;
    }
}