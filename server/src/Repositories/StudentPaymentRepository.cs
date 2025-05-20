/*
*@author Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.src.Configs;
using server.src.Data;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class StudentPaymentRepository(ServerDbContext dbContext, ILogger<StudentPaymentRepository> logger, IHttpContextAccessor httpContextAccessor) : IStudentPaymentRepository
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<StudentPaymentRepository> _logger = logger;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task<ResponseDto> Create(StudentPaymentCreateDto paymentCreateDto)
        {
            try
            {
                var userPrincipal = _httpContextAccessor.HttpContext?.User;
                if (userPrincipal == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }
                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userIdValue = userId.Value;
                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == userIdValue);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userNameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var userName = userNameClaim?.Value;

                var newID = GeneratePaymentId();
                if (newID is null) return null!;
                
                var inwords = ValorPorExtenso.ConverterParaExtenso(paymentCreateDto.AmountMT);

                //Console.WriteLine($"Receipt ID = {newID} \nInWords = {inwords}");

                var receiptData = new StudentPaymentModel
                {
                    Id = newID,
                    StudentId = paymentCreateDto.StudentId,
                    ReceivedFrom = paymentCreateDto.ReceivedFrom,
                    DescriptionEnglish = paymentCreateDto.Description,
                    DescriptionPortuguese = GetReferent(paymentCreateDto.Description),
                    Method = paymentCreateDto.Method,
                    AmountMT = paymentCreateDto.AmountMT,
                    InWords = inwords,
                    Status = "Paid",
                    Days = DateTime.Now.Day,
                    Months = GetMonth(DateTime.Now.Month),
                    Years = DateTime.Now.Year,
                    Times = DateTime.Now.ToString("HH:mm:ss"),
                    
                    TrainerId = user.Id,
                    TrainerName = userName!
                };

                await _dbContext.StudentPayments.AddAsync(receiptData);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Receipt created successfuly."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create payment.");
                return new ResponseDto { IsSuccess = false, Message = "Failed to create payment." };
            }
        }

        public async Task<List<StudentPaymentModel>> Details()
        {
            var paymentData = await _dbContext.StudentPayments.AsNoTracking().ToListAsync();

            return [.. paymentData.Select(p => new StudentPaymentModel
            {
                Order = p.Order,
                Id = p.Id,
                StudentId = p.StudentId,
                ReceivedFrom = p.ReceivedFrom,
                DescriptionEnglish = p.DescriptionEnglish,
                DescriptionPortuguese = p.DescriptionPortuguese,
                Method = p.Method,
                AmountMT = p.AmountMT,
                InWords = p.InWords,
                Status = p.Status,
                Days = p.Days,
                Months = p.Months,
                Years = p.Years,
                Times = p.Times,
                DateRegister = p.DateRegister,
                StudentData = p.StudentData,
                TrainerId = p.TrainerId,
                TrainerName = p.TrainerName
            }).OrderByDescending(p => p.Order)];
        }

        public async Task<string> GetStudentPaymentByLastId()
        {
            var studentId = await _dbContext.StudentPayments
                .OrderByDescending(s => s.Order)
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            if (studentId is null) return null!;

            return studentId;
        }

        public async Task<StudentPaymentModel> GetStudentPaymentById(string id)
        {
            // Inclua StudentData e relacionamentos necessários
            var student = await _dbContext.StudentPayments
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null) return null!;

            // Mapeamento completo
            return new StudentPaymentModel
            {
                Order = student.Order,
                Id = student.Id,
                ReceivedFrom = student.ReceivedFrom,
                DescriptionEnglish = student.DescriptionEnglish,
                DescriptionPortuguese = student.DescriptionPortuguese,
                Method = student.Method,
                AmountMT = student.AmountMT,
                InWords = student.InWords,
                Status = student.Status,
                Days = student.Days,
                Months = student.Months,
                Years = student.Years,
                Times = student.Times,
                DateRegister = student.DateRegister,
                StudentId = student.StudentId,
                StudentData = null,
                TrainerId = student.TrainerId,
                TrainerName = student.TrainerName,
                Trainer = null,
            };
        }

        private string GeneratePaymentId()
        {
            try
            {
                long lastOrder = _dbContext.StudentPayments
                    .OrderByDescending(p => p.Order)
                    .Select(p => p.Order)
                    .FirstOrDefault();

                long nextOrder = lastOrder + 1;

                return $"{nextOrder:D7}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Payment ID.");
                throw new InvalidOperationException("Failed to generate Payment ID.");
            }
        }

        private static string GetMonth(int month)
        {
            if(month == 1)
            { return "Janeiro"; }
            else if(month == 2)
            { return "Fevereiro"; }
            else if(month == 3)
            { return "Março"; }
            else if(month == 4)
            { return "Abril"; }
            else if(month == 5)
            { return "Maio"; }
            else if(month == 6)
            { return "Junho"; }
            else if(month == 7)
            { return "Julho"; }
            else if(month == 8)
            { return "Agosto"; }
            else if(month == 9)
            { return "Setembro"; }
            else if(month == 10)
            { return "Outubro"; }
            else if(month == 11)
            { return "Novembro"; }
            else if(month == 12)
            { return "Dezembro"; }

            return "";
        }

        private static string GetReferent(string description)
        {
            if (description == "Certificate")
            { return "Taxa de Certificado"; }
            else if (description == "Enrollment")
            { return "Taxa de Inscrição"; }
            else if (description == "Examination")
            { return "Taxa de Exame"; }
            else if (description == "January Tuition Fee")
            { return "Mensalidade de Janeiro"; }
            else if (description == "February Tuition Fee")
            { return "Mensalidade de Fevereiro"; }
            else if (description == "March Tuition Fee")
            { return "Mensalidade de Março"; }
            else if (description == "April Tuition Fee")
            { return "Mensalidade de Abril"; }
            else if (description == "May Tuition Fee")
            { return "Mensalidade de Maio"; }
            else if (description == "June Tuition Fee")
            { return "Mensalidade de Junho"; }
            else if (description == "July Tuition Fee")
            { return "Mensalidade de Julho"; }
            else if (description == "August Tuition Fee")
            { return "Mensalidade de Agosto"; }
            else if (description == "September Tuition Fee")
            { return "Mensalidade de Setembro"; }
            else if (description == "October Tuition Fee")
            { return "Mensalidade de Outubro"; }
            else if (description == "November Tuition Fee")
            { return "Mensalidade de Novembro"; }
            else if (description == "December Tuition Fee")
            { return "Mensalidade de Dezembro"; }
            else
            { return description; }
        }
    }
}