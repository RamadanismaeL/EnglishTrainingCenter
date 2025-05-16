/*
*@author Ramadan Ismael
*/

using System.Globalization;
using server.src.Enums;

namespace server.src.DTOs
{
    public class TrainerDetailsSubsidyDto
    {
        public string? ProfileImage { get; set; }
        public string Id { get; set;} = string.Empty;
        public string? FullName { get; set; } = string.Empty;
        public string? Position { get; set; } = string.Empty;
        public TrainerStatusEnum Status { get; set; }
        public decimal SubsidyMT { get; set; }        
        public DateTime? DateUpdate { get; set; }
        public string SubsidyMTFormatted => SubsidyMT.ToString("N2", CultureInfo.GetCultureInfo("pt-BR"));
    }
}