/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.Models
{
    public class StudentCourseFeeModel
    {
        public long Order { get; set; }
        [Key]
        public string Id { get; set; } = string.Empty;

        public decimal PriceTotal { get; set; } = 0.0M;
        public decimal PricePaid { get; set; } = 0.0M;
        public decimal PriceDue { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? DateUpdate { get; set; }

        public string StudentId { get; set; } = string.Empty;
        public StudentDataModel? StudentData { get; set; }
        
        public ICollection<StudentPaymentModel>? Payments { get; set; }
    }
}