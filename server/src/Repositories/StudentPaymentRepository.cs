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
        private static string previousAmountValue = string.Empty;

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

                using var transaction = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    if (!string.IsNullOrEmpty(paymentCreateDto.CourseFeeId))
                    {
                        decimal priceDue = GetPriceDue(paymentCreateDto.CourseFeeId);
                        decimal newPricePaid = 0.0M;

                        decimal courseFeeTotal = GetAmount("CourseFee");
                        var courseFee = await _dbContext.StudentCourseFee.FirstOrDefaultAsync(cf => cf.Id == paymentCreateDto.CourseFeeId);
                        if (courseFee is null)
                            return new ResponseDto
                            {
                                IsSuccess = false,
                                Message = "Id not found."
                            };

                        if (priceDue == 0 || paymentCreateDto.AmountMT > priceDue)
                        { newPricePaid = priceDue; }
                        else if (paymentCreateDto.AmountMT <= priceDue)
                        { newPricePaid = paymentCreateDto.AmountMT; }

                        courseFee.PricePaid += newPricePaid;
                        courseFee.DateUpdate = DateTime.Now;

                        await _dbContext.SaveChangesAsync();
                    }

                    var receiptData = new StudentPaymentModel
                    {
                        Id = newID,
                        StudentId = paymentCreateDto.StudentId,
                        CourseFeeId = paymentCreateDto.CourseFeeId,
                        ReceivedFrom = paymentCreateDto.ReceivedFrom,
                        DescriptionEnglish = GetReferent("en", paymentCreateDto.Description, paymentCreateDto.CourseFeeId!),
                        DescriptionPortuguese = GetReferent("pt", paymentCreateDto.Description, paymentCreateDto.CourseFeeId!),
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

                    if (receiptData != null) await _dbContext.StudentPayments.AddAsync(receiptData);

                    await _dbContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"[Error] Transaction failed: {ex.Message}");
                    throw;
                }

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
            var paymentData = await _dbContext.StudentPayments
                .AsNoTracking()
                .ToListAsync();

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
                CourseFeeId = p.CourseFeeId,
                CourseFeeData = p.CourseFeeData,
                TrainerId = p.TrainerId,
                TrainerName = p.TrainerName,
                MonthlyTuitionData = p.MonthlyTuitionData
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

        private decimal GetAmount(string id)
        {
            var checkId = _dbContext.SettingsAmountMt.FirstOrDefault(s => s.Id == id);

            if (checkId is null) return 0;

            return checkId.AmountMT;
        }

        private static string GetMonth(int month)
        {
            if (month == 1)
            { return "Janeiro"; }
            else if (month == 2)
            { return "Fevereiro"; }
            else if (month == 3)
            { return "Março"; }
            else if (month == 4)
            { return "Abril"; }
            else if (month == 5)
            { return "Maio"; }
            else if (month == 6)
            { return "Junho"; }
            else if (month == 7)
            { return "Julho"; }
            else if (month == 8)
            { return "Agosto"; }
            else if (month == 9)
            { return "Setembro"; }
            else if (month == 10)
            { return "Outubro"; }
            else if (month == 11)
            { return "Novembro"; }
            else if (month == 12)
            { return "Dezembro"; }

            return "";
        }

        private string GetReferent(string language, string description, string courseFeeId)
        {
            if (string.IsNullOrEmpty(courseFeeId))
            {
                if (description == "Certificate")
                {
                    if (language == "pt") return "Taxa de Certificado";
                    if (language == "en") return "Certificate Fee";
                }
                else if (description == "Enrollment")
                {
                    if (language == "pt") return "Taxa de Inscrição";
                    if (language == "en") return "Enrollment Fee";
                }
                else if (description == "Examination")
                {
                    if (language == "pt") return "Taxa de Exame";
                    if (language == "en") return "Examination Fee";
                }
                else if (description == "January Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Janeiro";
                    if (language == "en") return "January Tuition Fee";
                }
                else if (description == "February Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Fevereiro";
                    if (language == "en") return "February Tuition Fee";
                }
                else if (description == "March Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Março";
                    if (language == "en") return "March Tuition Fee";
                }
                else if (description == "April Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Abril";
                    if (language == "en") return "April Tuition Fee";
                }
                else if (description == "May Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Maio";
                    if (language == "en") return "May Tuition Fee";
                }
                else if (description == "June Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Junho";
                    if (language == "en") return "June Tuition Fee";
                }
                else if (description == "July Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Julho";
                    if (language == "en") return "July Tuition Fee";
                }
                else if (description == "August Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Agosto";
                    if (language == "en") return "August Tuition Fee";
                }
                else if (description == "September Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Setembro";
                    if (language == "en") return "September Tuition Fee";
                }
                else if (description == "October Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Outbro";
                    if (language == "en") return "October Tuition Fee";
                }
                else if (description == "November Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Novembro";
                    if (language == "en") return "November Tuition Fee";
                }
                else if (description == "December Tuition Fee")
                {
                    if (language == "pt") return "Mensalidade de Dezembro";
                    if (language == "en") return "December Tuition Fee";
                }
                else
                { return description; }
            }
            else
            {
                decimal priceDue = GetPriceDue(courseFeeId);
                int count = PaymentCount(courseFeeId);
                int next = count + 1;

                if (description == "Course Fee")
                {
                    if (priceDue == 0)
                    {
                        if (language == "pt") return "Taxa do Curso Completo";
                        if (language == "en") return "Full Course Fee";
                    }
                    else if (priceDue > 0)
                    {
                        if (language == "pt") return $"{next}ª Prestação da Taxa do Curso – Valor em dívida: {OnAmount(priceDue)} MT";
                        if (language == "en") return $"{next}th Installment of the Full Course Fee – Outstanding Amount: {OnAmount(priceDue)} MT";
                    }
                }
                else
                {
                    return "Error Course Fee";
                }
            }

            return "Error";
        }

        private decimal GetPriceDue(string id)
        {
            var checkId = _dbContext.StudentCourseFee.FirstOrDefault(s => s.Id == id);

            if (checkId is null) return 0;

            return checkId.PriceDue;
        }

        private int PaymentCount(string courseFeeId)
        {
            return _dbContext.StudentCourseFee
                .Where(s => s.Id == courseFeeId)
                .Select(s => s.Payments!.Count)
                .FirstOrDefault();
        }

        private static string OnAmount(decimal value)
        {
            // Verifica o valor máximo
            if (value > 10000000000m)
            {
                return previousAmountValue ?? string.Empty;
            }

            // Formata o valor com separadores de milhar e 2 casas decimais
            string formattedValue = value.ToString("#,##0.00", System.Globalization.CultureInfo.GetCultureInfo("pt-BR"));

            // Armazena o valor formatado para uso futuro
            previousAmountValue = formattedValue;

            return formattedValue;
        }
    }
}