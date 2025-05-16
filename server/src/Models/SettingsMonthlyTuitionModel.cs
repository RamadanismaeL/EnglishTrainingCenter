/*
*@author Ramadan Ismael
*/

namespace server.src.Models
{
    public class SettingsMonthlyTuitionModel
    {
        public string Id { get; set; } = string.Empty;
        public decimal Intensive { get; set; }
        public decimal Private { get; set; }
        public decimal Regular { get; set; }
    }
}