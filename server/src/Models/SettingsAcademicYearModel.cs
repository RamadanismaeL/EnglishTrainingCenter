/*
* @author Ramadan Ismael
*/

namespace server.src.Models
{
    public class SettingsAcademicYearModel
    {
        public int Id { get; set; }
        public int Day { get; set; }
        public string  Month { get; set; } = string.Empty;        
        public int Year { get; set; }
    }
}