/*
* 2025 | @author Ramadan Ismael
*/

namespace server.src.DTOs
{
    public class StudentBalanceList
    {
        public string StudentID { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Package { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Modality { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}