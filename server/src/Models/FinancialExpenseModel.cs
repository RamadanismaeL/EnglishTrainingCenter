/*
*@author Ramadan Ismael
*/

namespace server.src.Models
{
    public class FinancialExpenseModel
    {
        public long Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public decimal AmountMT { get; set; }        
        public DateTime LastUpdate { get; set; }
        public string Status { get; set; } = string.Empty; //Approved, Cancelled
        public string TrainerName { get; set; } = string.Empty;
    }
}