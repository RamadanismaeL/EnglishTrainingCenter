/*
*@author Ramadan Ismael
*/

using System.ComponentModel.DataAnnotations;

namespace server.src.Models
{
    public class StudentPaymentModel
    {
        public long Order { get; set; }
        [Key]
        public string Id { get; set; } = string.Empty; // Receipt ID

        public string ReceivedFrom { get; set; } = string.Empty;
        public string DescriptionEnglish { get; set; } = string.Empty; // Certificate Fee, Enrollment, Exam Fee, MonthlyFee  

        public string DescriptionPortuguese { get; set; } = string.Empty; // Inscrição, Mensalidade de Abril,...

        public string Method { get; set; } = string.Empty; // Banco, E-Mola, M-Pesa,...
        public decimal AmountMT { get; set; }
        public string InWords { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Paid
        public int Days { get; set; }
        public string Months { get; set; } = string.Empty;
        public int Years { get; set; }
        public string Times { get; set; } = string.Empty;
        public DateTime DateRegister { get; set; }

        public string StudentId { get; set; } = string.Empty;
        public StudentDataModel? StudentData { get; set; }

        // Referência para a mensalidade (opcional - só para pagamentos de mensalidade)
        public StudentMonthlyTuitionModel? MonthlyTuitionData { get; set; }

        public string TrainerId { get; set; } = string.Empty;
        public string TrainerName { get; set; } = string.Empty;
        public TrainerModel? Trainer { get; set; }
    }
}