/*
*@author Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.src.Data;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class StudentRepository(ServerDbContext dbContext, ILogger<StudentRepository> logger, IHttpContextAccessor httpContextAccessor) : IStudentRepository
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<StudentRepository> _logger = logger;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task<ResponseDto> Create(StudentCreateDto studentCreateDto)
        {
            try
            {
                var trainerAuth = _httpContextAccessor.HttpContext?.User;
                if (trainerAuth == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }

                var trainerId = trainerAuth.FindFirst(ClaimTypes.NameIdentifier);
                if (trainerId == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var trainerIdValue = trainerId.Value;
                var trainer = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == trainerIdValue);
                if (trainer == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userNameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var trainerName = userNameClaim?.Value;


                var studentExistIdDoc = !string.IsNullOrEmpty(studentCreateDto.IdNumber)
                    && await _dbContext.StudentData.AnyAsync(s => s.IdNumber == studentCreateDto.IdNumber);

                var studentExistFullName = !string.IsNullOrEmpty(studentCreateDto.FullName)
                    && await _dbContext.StudentData.AnyAsync(s => s.FullName == studentCreateDto.FullName);


                if (studentExistIdDoc || studentExistFullName)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Student already exist!"
                    };
                }


                var newId = GenerateStudentID();

                if (newId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Failed to generate a new Student ID."
                    };
                }

                //Console.WriteLine($"New Student ID: {newId}");   
                decimal monthlyFee = GetSettingsMonthlyTuition($"{studentCreateDto.Level}-{studentCreateDto.Modality}", $"{studentCreateDto.Package}");

                decimal courseFee = GetAmount("CourseFee");
                decimal installment = GetAmount("Installments");

                int age = DateTime.Now.Year - studentCreateDto.DateOfBirthCalc.Year;

                var studentData = new StudentDataModel
                {
                    Id = newId,

                    DocumentType = studentCreateDto.DocumentType,
                    IdNumber = studentCreateDto.IdNumber,
                    PlaceOfIssue = studentCreateDto.PlaceOfIssue,
                    ExpirationDate = studentCreateDto.ExpirationDate,

                    FullName = studentCreateDto.FullName,
                    DateOfBirth = studentCreateDto.DateOfBirth,
                    DateOfBirthCalc = studentCreateDto.DateOfBirthCalc,
                    Gender = studentCreateDto.Gender,
                    MaritalStatus = studentCreateDto.MaritalStatus,
                    Nationality = studentCreateDto.Nationality,
                    PlaceOfBirth = studentCreateDto.PlaceOfBirth,
                    ResidentialAddress = studentCreateDto.ResidentialAddress,
                    FirstPhoneNumber = studentCreateDto.FirstPhoneNumber,
                    SecondPhoneNumber = studentCreateDto.SecondPhoneNumber,
                    EmailAddress = studentCreateDto.EmailAddress,
                    AdditionalNotes = studentCreateDto.AdditionalNotes,

                    GuardFullName = studentCreateDto.GuardFullName,
                    GuardRelationship = studentCreateDto.GuardRelationship,
                    GuardResidentialAddress = studentCreateDto.GuardResidentialAddress,
                    GuardFirstPhoneNumber = studentCreateDto.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = studentCreateDto.GuardSecondPhoneNumber,
                    GuardEmailAddress = studentCreateDto.GuardEmailAddress,

                    Status = "Active",
                    TrainerName = trainerName!
                };

                var studentEnrollmentForm = new StudentEnrollmentFormModel
                {
                    StudentId = newId,

                    CourseName = "Inglês",
                    Package = GetConvertCourse(studentCreateDto.Package),
                    Level = studentCreateDto.Level,
                    Modality = GetConvertCourse(studentCreateDto.Modality),
                    AcademicPeriod = GetConvertCourse(studentCreateDto.AcademicPeriod),
                    Schedule = studentCreateDto.Schedule,
                    Duration = "3 Meses",
                    MonthlyFee = monthlyFee,
                    Age = age,

                    CourseFee = courseFee,
                    Installments = installment,

                    Days = DateTime.Now.Day,
                    //Months = DateTime.Now.ToString("MMMM"),
                    Months = GetMonth(DateTime.Now.Month),
                    Years = DateTime.Now.Year,
                    Times = DateTime.Now,

                    TrainerName = trainerName!
                };

                var newCourseFeeId = GenerateStudentCourseFeeID();

                if (newCourseFeeId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Failed to generate a new course fee Id."
                    };
                }

                var studentCourseFee = new StudentCourseFeeModel
                {
                    Id = newCourseFeeId,
                    PriceTotal = courseFee,
                    PricePaid = 0.0M,
                    StudentId = newId
                };

                //Console.WriteLine($"Student ID = {newId}\nMonthly Fee = {monthlyFee} \nCourse Fee = {courseFee} \nInstallment = {installment} \nAge = {age}");

                using var transaction = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    if (studentData != null) await _dbContext.StudentData.AddAsync(studentData);
                    if (studentEnrollmentForm != null) await _dbContext.StudentEnrollmentForm.AddAsync(studentEnrollmentForm);
                    if (studentCourseFee != null) await _dbContext.StudentCourseFee.AddAsync(studentCourseFee);

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
                    Message = "Student created successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating students.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An unexpected error occurred while creating."
                };
            }
        }

        public async Task<ResponseDto> Update(StudentUpdateDto studentUpdateDto)
        {
            try
            {
                var trainerAuth = _httpContextAccessor.HttpContext?.User;
                if (trainerAuth == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }

                var trainerId = trainerAuth.FindFirst(ClaimTypes.NameIdentifier);
                if (trainerId == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var trainerIdValue = trainerId.Value;
                var trainer = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == trainerIdValue);
                if (trainer == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userNameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var trainerName = userNameClaim?.Value;


                var studentExistIdDoc = !string.IsNullOrEmpty(studentUpdateDto.IdNumber)
                    && await _dbContext.StudentData.AnyAsync(s => s.IdNumber == studentUpdateDto.IdNumber && s.Order != studentUpdateDto.Order);

                var studentExistFullName = !string.IsNullOrEmpty(studentUpdateDto.FullName)
                    && await _dbContext.StudentData.AnyAsync(s => s.FullName == studentUpdateDto.FullName && s.Order != studentUpdateDto.Order);


                if (studentExistIdDoc || studentExistFullName)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Student already exist!"
                    };
                }

                var student = await _dbContext.StudentData.FindAsync(studentUpdateDto.Order);
                if (student == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                student.DocumentType = studentUpdateDto.DocumentType;
                student.IdNumber = studentUpdateDto.IdNumber;
                student.PlaceOfIssue = studentUpdateDto.PlaceOfIssue;
                student.ExpirationDate = studentUpdateDto.ExpirationDate;

                student.FullName = studentUpdateDto.FullName;
                student.DateOfBirth = studentUpdateDto.DateOfBirth;
                student.DateOfBirthCalc = studentUpdateDto.DateOfBirthCalc;
                student.Gender = studentUpdateDto.Gender;
                student.MaritalStatus = studentUpdateDto.MaritalStatus;
                student.Nationality = studentUpdateDto.Nationality;
                student.PlaceOfBirth = studentUpdateDto.PlaceOfBirth;
                student.ResidentialAddress = studentUpdateDto.ResidentialAddress;
                student.FirstPhoneNumber = studentUpdateDto.FirstPhoneNumber;
                student.SecondPhoneNumber = studentUpdateDto.SecondPhoneNumber;
                student.EmailAddress = studentUpdateDto.EmailAddress;
                student.AdditionalNotes = studentUpdateDto.AdditionalNotes;

                student.GuardFullName = studentUpdateDto.GuardFullName;
                student.GuardRelationship = studentUpdateDto.GuardRelationship;
                student.GuardResidentialAddress = studentUpdateDto.GuardResidentialAddress;
                student.GuardFirstPhoneNumber = studentUpdateDto.GuardFirstPhoneNumber;
                student.GuardSecondPhoneNumber = studentUpdateDto.GuardSecondPhoneNumber;
                student.GuardEmailAddress = studentUpdateDto.GuardEmailAddress;

                student.DateUpdate = DateTime.Now;
                student.TrainerName = trainerName!;

                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Student updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating."
                };
            }
        }

        public async Task<List<StudentDataModel>> DetailStudentData()
        {
            return await _dbContext.StudentData
                .AsNoTracking()
                //.Include(sf => sf.EnrollmentForm)
                //.Include(cf => cf.StudentCourseFee)
                //.Include(sc => sc.CourseInfo)
                //.Include(sp => sp.Payments)
                .Select(s => new StudentDataModel
                {
                    Order = s.Order,
                    Id = s.Id,

                    DocumentType = s.DocumentType,
                    IdNumber = s.IdNumber,
                    PlaceOfIssue = s.PlaceOfIssue,
                    ExpirationDate = s.ExpirationDate,

                    FullName = s.FullName,
                    DateOfBirth = s.DateOfBirth,
                    DateOfBirthCalc = s.DateOfBirthCalc,
                    Gender = s.Gender,
                    MaritalStatus = s.MaritalStatus,
                    Nationality = s.Nationality,
                    PlaceOfBirth = s.PlaceOfBirth,
                    ResidentialAddress = s.ResidentialAddress,
                    FirstPhoneNumber = s.FirstPhoneNumber,
                    SecondPhoneNumber = s.SecondPhoneNumber,
                    EmailAddress = s.EmailAddress,
                    AdditionalNotes = s.AdditionalNotes,

                    GuardFullName = s.GuardFullName,
                    GuardRelationship = s.GuardRelationship,
                    GuardResidentialAddress = s.GuardResidentialAddress,
                    GuardFirstPhoneNumber = s.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = s.GuardSecondPhoneNumber,
                    GuardEmailAddress = s.GuardEmailAddress,

                    Status = s.Status,
                    TrainerName = s.TrainerName,
                    DateUpdate = s.DateUpdate,

                    StudentCourseFee = s.StudentCourseFee,
                    //EnrollmentForm = s.EnrollmentForm,
                    CourseInfo = s.CourseInfo,
                    //Payments = s.Payments
                })
                .OrderBy(s => s.FullName)
                .ToListAsync();
        }

        public async Task<string> GetStudentByLastId()
        {
            var studentId = await _dbContext.StudentData
                .AsNoTracking()
                .OrderByDescending(s => s.Order)
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            if (studentId is null) return null!;

            return studentId;
        }

        public async Task<string> GetStudentCourseFeeByLastId()
        {
            var courseFeeId = await _dbContext.StudentCourseFee
                .AsNoTracking()
                .OrderByDescending(s => s.Order)
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            if (courseFeeId is null) return null!;

            return courseFeeId;
        }

        public async Task<List<StudentEnrollmentFormModel>> DetailStudentEnrollmentForm()
        {
            return await _dbContext.StudentEnrollmentForm
                .AsNoTracking()
                .Select(s => new StudentEnrollmentFormModel
                {
                    StudentId = s.StudentId,
                    CourseName = s.CourseName,
                    Package = s.Package,
                    Level = s.Level,
                    Modality = s.Modality,
                    AcademicPeriod = s.AcademicPeriod,
                    Schedule = s.Schedule,
                    Duration = s.Duration,
                    MonthlyFee = s.MonthlyFee,
                    Age = s.Age,
                    CourseFee = s.CourseFee,
                    Installments = s.Installments,
                    Days = s.Days,
                    Months = s.Months,
                    Years = s.Years,
                    Times = s.Times,
                    TrainerName = s.TrainerName,
                    StudentData = s.StudentData
                })
                .ToListAsync();
        }

        /*public async Task<List<StudentDataModel>> DetailStudentCourseInProgress()
        {
            return await _dbContext.StudentData
                .AsNoTracking()
                .Include(sc => sc.CourseInfo!.Where(c => c.Status == "In Progress"))
                .Select(s => new StudentDataModel
                {
                    Order = s.Order,
                    Id = s.Id,

                    DocumentType = s.DocumentType,
                    IdNumber = s.IdNumber,
                    PlaceOfIssue = s.PlaceOfIssue,
                    ExpirationDate = s.ExpirationDate,

                    FullName = s.FullName,
                    DateOfBirth = s.DateOfBirth,
                    DateOfBirthCalc = s.DateOfBirthCalc,
                    Gender = s.Gender,
                    MaritalStatus = s.MaritalStatus,
                    Nationality = s.Nationality,
                    PlaceOfBirth = s.PlaceOfBirth,
                    ResidentialAddress = s.ResidentialAddress,
                    FirstPhoneNumber = s.FirstPhoneNumber,
                    SecondPhoneNumber = s.SecondPhoneNumber,
                    EmailAddress = s.EmailAddress,
                    AdditionalNotes = s.AdditionalNotes,

                    GuardFullName = s.GuardFullName,
                    GuardRelationship = s.GuardRelationship,
                    GuardFirstPhoneNumber = s.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = s.GuardSecondPhoneNumber,
                    GuardEmailAddress = s.GuardEmailAddress,

                    TrainerName = s.TrainerName,
                    DateUpdate = s.DateUpdate,

                    CourseInfo = s.CourseInfo!.Where(c => c.Status == "In Progress").ToList()
                })
                .OrderBy(s => s.FullName)
                .ToListAsync();
        }*/

        public async Task<StudentEnrollmentFormModel> GetStudentEnrollmentFormById(string id)
        {
            // Inclua StudentData e relacionamentos necessários
            var student = await _dbContext.StudentEnrollmentForm
                .AsNoTracking()
                .Include(s => s.StudentData) // Carrega os dados relacionados
                .ThenInclude(sd => sd!.Payments) // Se Payments for uma subpropriedade
                .Include(s => s.StudentData!.CourseInfo) // Se CourseInfo existir
                .FirstOrDefaultAsync(s => s.StudentId == id);

            if (student == null) return null!;

            // Mapeamento completo
            return new StudentEnrollmentFormModel
            {
                StudentId = student.StudentId,
                StudentData = new StudentDataModel // Crie o objeto StudentDataModel
                {
                    Order = student.StudentData!.Order,
                    Id = student.StudentData.Id,
                    DocumentType = student.StudentData.DocumentType,
                    IdNumber = student.StudentData.IdNumber,
                    PlaceOfIssue = student.StudentData.PlaceOfIssue,
                    ExpirationDate = student.StudentData.ExpirationDate,
                    FullName = student.StudentData.FullName,
                    DateOfBirth = student.StudentData.DateOfBirth,
                    DateOfBirthCalc = student.StudentData.DateOfBirthCalc,
                    Gender = student.StudentData.Gender,
                    MaritalStatus = student.StudentData.MaritalStatus,
                    Nationality = student.StudentData.Nationality,
                    PlaceOfBirth = student.StudentData.PlaceOfBirth,
                    ResidentialAddress = student.StudentData.ResidentialAddress,
                    FirstPhoneNumber = student.StudentData.FirstPhoneNumber,
                    SecondPhoneNumber = student.StudentData.SecondPhoneNumber,
                    EmailAddress = student.StudentData.EmailAddress,
                    AdditionalNotes = student.StudentData.AdditionalNotes,
                    GuardFullName = student.StudentData.GuardFullName,
                    GuardRelationship = student.StudentData.GuardRelationship,
                    GuardResidentialAddress = student.StudentData.GuardResidentialAddress,
                    GuardFirstPhoneNumber = student.StudentData.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = student.StudentData.GuardSecondPhoneNumber,
                    GuardEmailAddress = student.StudentData.GuardEmailAddress,
                    Status = student.StudentData.Status,
                    TrainerName = student.StudentData.TrainerName,
                    DateUpdate = student.StudentData.DateUpdate,
                    CourseInfo = null,
                    Payments = student.StudentData.Payments?.Select(p => new StudentPaymentModel
                    {
                        Order = p.Order,
                        Id = p.Id,
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
                        StudentId = p.StudentId,
                        TrainerId = p.TrainerId,
                        TrainerName = p.TrainerName
                    }).ToList(),
                    EnrollmentForm = null
                },
                CourseName = student.CourseName,
                Package = student.Package,
                Level = student.Level,
                Modality = student.Modality,
                AcademicPeriod = student.AcademicPeriod,
                Schedule = student.Schedule,
                Duration = student.Duration,
                MonthlyFee = student.MonthlyFee,
                Age = student.Age,
                CourseFee = student.CourseFee,
                Installments = student.Installments,
                Days = student.Days,
                Months = student.Months,
                Years = student.Years,
                Times = student.Times,
                TrainerName = student.TrainerName
            };
        }

        public async Task<StudentDataModel> GetStudentDataByName(string fullName)
        {
            // Inclua StudentData e relacionamentos necessários
            var student = await _dbContext.StudentData
                .Where(s => s.FullName == fullName)
                .Select(s => new {
                    s.Order,
                    s.Id,
                    s.DocumentType,
                    s.IdNumber,
                    s.PlaceOfIssue,
                    s.ExpirationDate,

                    s.FullName,
                    s.DateOfBirth,
                    s.DateOfBirthCalc,
                    s.Gender,
                    s.MaritalStatus,
                    s.Nationality,
                    s.PlaceOfBirth,
                    s.ResidentialAddress,
                    s.FirstPhoneNumber,
                    s.SecondPhoneNumber,
                    s.EmailAddress,
                    s.AdditionalNotes,

                    s.GuardFullName,
                    s.GuardRelationship,
                    s.GuardFirstPhoneNumber,
                    s.GuardSecondPhoneNumber,
                    s.GuardEmailAddress,
                    
                    s.Status,
                    s.TrainerName,
                    s.DateUpdate,

                    CourseInfo = s.CourseInfo!.Where(c => c.Status == "In Progress"),
                    s.StudentCourseFee
                })
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (student == null) return null!;

            // Mapeamento completo
            return new StudentDataModel
            {
                Order = student.Order,
                Id = student.Id,

                DocumentType = student.DocumentType,
                IdNumber = student.IdNumber,
                PlaceOfIssue = student.PlaceOfIssue,
                ExpirationDate = student.ExpirationDate,

                FullName = student.FullName,
                DateOfBirth = student.DateOfBirth,
                DateOfBirthCalc = student.DateOfBirthCalc,
                Gender = student.Gender,
                MaritalStatus = student.MaritalStatus,
                Nationality = student.Nationality,
                PlaceOfBirth = student.PlaceOfBirth,
                ResidentialAddress = student.ResidentialAddress,
                FirstPhoneNumber = student.FirstPhoneNumber,
                SecondPhoneNumber = student.SecondPhoneNumber,
                EmailAddress = student.EmailAddress,
                AdditionalNotes = student.AdditionalNotes,

                GuardFullName = student.GuardFullName,
                GuardRelationship = student.GuardRelationship,
                GuardFirstPhoneNumber = student.GuardFirstPhoneNumber,
                GuardSecondPhoneNumber = student.GuardSecondPhoneNumber,
                GuardEmailAddress = student.GuardEmailAddress,

                Status = student.Status,
                TrainerName = student.TrainerName,
                DateUpdate = student.DateUpdate,

                CourseInfo = [.. student.CourseInfo.Select(s => new StudentCourseInfoModel
                {
                    StudentId = s.StudentId,
                    CourseName = s.CourseName,
                    Package = s.Package,
                    Level = s.Level,
                    Modality = s.Modality,
                    AcademicPeriod = s.AcademicPeriod,
                    Schedule = s.Schedule,
                    Duration = s.Duration,
                    MonthlyFee = s.MonthlyFee,
                    QuizOne = s.QuizOne,
                    QuizTwo = s.QuizTwo,
                    Exam = s.Exam,
                    FinalAverage = s.FinalAverage,
                    Status = s.Status,
                    TrainerName = s.TrainerName,
                    DateUpdate = s.DateUpdate,
                    StudentData = null
                })],

                StudentCourseFee = student.StudentCourseFee
            };
        }

        public async Task<StudentUpdateDto> GetStudentListProfileEditById(string id)
        {
            var student = await _dbContext.StudentData
                .AsNoTracking()
                .Include(c => c.CourseInfo)
                .Where(s => s.Id == id)
                .Select(x => new StudentUpdateDto
                {
                    Order = x.Order,
                    DocumentType = x.DocumentType,
                    IdNumber = x.IdNumber,
                    PlaceOfIssue = x.PlaceOfIssue,
                    ExpirationDate = x.ExpirationDate,

                    FullName = x.FullName,
                    DateOfBirth = x.DateOfBirth,
                    Gender = x.Gender,
                    MaritalStatus = x.MaritalStatus,
                    Nationality = x.Nationality,
                    PlaceOfBirth = x.PlaceOfBirth,
                    ResidentialAddress = x.ResidentialAddress,
                    FirstPhoneNumber = x.FirstPhoneNumber,
                    SecondPhoneNumber = x.SecondPhoneNumber,
                    EmailAddress = x.EmailAddress,
                    AdditionalNotes = x.AdditionalNotes,

                    GuardFullName = x.GuardFullName,
                    GuardRelationship = x.GuardRelationship,
                    GuardResidentialAddress = x.GuardResidentialAddress,
                    GuardFirstPhoneNumber = x.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = x.GuardSecondPhoneNumber,
                    GuardEmailAddress = x.GuardEmailAddress
                })
                .FirstOrDefaultAsync();

            return student!;
        }

        public async Task<StudentListProfileDto> GetStudentListProfileById(string id)
        {
            var student = await _dbContext.StudentData
                .AsNoTracking()
                .Include(c => c.CourseInfo)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    Student = s,
                    ActiveCourse = s.CourseInfo!.FirstOrDefault(c => c.Status == "In Progress")
                })
                .Where(x => x.ActiveCourse != null)
                .Select(x => new StudentListProfileDto
                {
                    Package = x.ActiveCourse!.Package,
                    Level = x.ActiveCourse!.Level,
                    Modality = x.ActiveCourse!.Modality,
                    AcademicPeriod = x.ActiveCourse!.AcademicPeriod,
                    Schedule = x.ActiveCourse!.Schedule,
                    MonthlyFee = x.ActiveCourse!.MonthlyFee,

                    DocumentType = x.Student.DocumentType,
                    IdNumber = x.Student.IdNumber,
                    PlaceOfIssue = x.Student.PlaceOfIssue,
                    ExpirationDate = x.Student.ExpirationDate,

                    FullName = x.Student.FullName,
                    DateOfBirth = x.Student.DateOfBirth,
                    Gender = x.Student.Gender,
                    MaritalStatus = x.Student.MaritalStatus,
                    Nationality = x.Student.Nationality,
                    PlaceOfBirth = x.Student.PlaceOfBirth,
                    ResidentialAddress = x.Student.ResidentialAddress,
                    FirstPhoneNumber = x.Student.FirstPhoneNumber,
                    SecondPhoneNumber = x.Student.SecondPhoneNumber,
                    EmailAddress = x.Student.EmailAddress,
                    AdditionalNotes = x.Student.AdditionalNotes,

                    GuardFullName = x.Student.GuardFullName,
                    GuardRelationship = x.Student.GuardRelationship,
                    GuardResidentialAddress = x.Student.GuardResidentialAddress,
                    GuardFirstPhoneNumber = x.Student.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = x.Student.GuardSecondPhoneNumber,
                    GuardEmailAddress = x.Student.GuardEmailAddress
                })
                .FirstOrDefaultAsync();

            return student!;
        }

        public async Task<StudentListProfileEnrollmentDto> GetStudentListProfileEnrollmentById(string id)
        {
            var student = await _dbContext.StudentEnrollmentForm
                .AsNoTracking()
                .Include(c => c.StudentData)
                .Where(s => s.StudentId == id)
                .Select(s => new
                {
                    StudentEnroll = s,
                    s.StudentData
                })
                .Where(x => x.StudentData != null)
                .Select(x => new StudentListProfileEnrollmentDto
                {
                    CourseName = x.StudentEnroll.CourseName,
                    Package = x.StudentEnroll.Package,
                    Level = x.StudentEnroll.Level,
                    Modality = x.StudentEnroll.Modality,
                    AcademicPeriod = x.StudentEnroll.AcademicPeriod,
                    Schedule = x.StudentEnroll.Schedule,
                    Duration = x.StudentEnroll.Duration,
                    MonthlyFee = x.StudentEnroll.MonthlyFee,
                    Age = x.StudentEnroll.Age,

                    CourseFee = x.StudentEnroll.CourseFee,
                    Installments = x.StudentEnroll.Installments,

                    Days = x.StudentEnroll.Days,
                    Months = x.StudentEnroll.Months,
                    Years = x.StudentEnroll.Years,
                    Times = x.StudentEnroll.Times,

                    DocumentType = x.StudentData!.DocumentType,
                    IdNumber = x.StudentData.IdNumber,
                    PlaceOfIssue = x.StudentData.PlaceOfIssue,
                    ExpirationDate = x.StudentData.ExpirationDate,

                    FullName = x.StudentData.FullName,
                    DateOfBirth = x.StudentData.DateOfBirth,
                    Gender = x.StudentData.Gender,
                    MaritalStatus = x.StudentData.MaritalStatus,
                    Nationality = x.StudentData.Nationality,
                    PlaceOfBirth = x.StudentData.PlaceOfBirth,
                    ResidentialAddress = x.StudentData.ResidentialAddress,
                    FirstPhoneNumber = x.StudentData.FirstPhoneNumber,
                    SecondPhoneNumber = x.StudentData.SecondPhoneNumber,
                    EmailAddress = x.StudentData.EmailAddress,
                    AdditionalNotes = x.StudentData.AdditionalNotes,

                    GuardFullName = x.StudentData.GuardFullName,
                    GuardRelationship = x.StudentData.GuardRelationship,
                    GuardResidentialAddress = x.StudentData.GuardResidentialAddress,
                    GuardFirstPhoneNumber = x.StudentData.GuardFirstPhoneNumber,
                    GuardSecondPhoneNumber = x.StudentData.GuardSecondPhoneNumber,
                    GuardEmailAddress = x.StudentData.GuardEmailAddress
                })
                .FirstOrDefaultAsync();

            return student!;
        }

        public async Task<IEnumerable<StudentCourseFeeModel>> GetStudentListCourseFee()
        {
            return await _dbContext.StudentCourseFee
                .AsNoTracking()
                .Include(sd => sd.StudentData)
                .Include(sc => sc.Payments)
                .Select(s => new StudentCourseFeeModel
                {
                    Order = s.Order,
                    Id = s.Id,
                    PriceTotal = s.PriceTotal,
                    PricePaid = s.PricePaid,
                    PriceDue = s.PriceDue,
                    Status = s.Status,
                    DateUpdate = s.DateUpdate,
                    StudentId = s.StudentId,
                    StudentData = s.StudentData,
                    Payments = s.Payments!.ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ListStudentActiveDto>> GetListStudentActive()
        {
            try
            {
                var currentDate = DateTime.Now;

                var query = _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Active")
                    .Select(s => new
                    {
                        Student = s,
                        ActiveCourse = s.CourseInfo!.FirstOrDefault(c => c.Status == "In Progress")
                    })
                    .Where(x => x.ActiveCourse != null)
                    .Select(x => new ListStudentActiveDto
                    {
                        Order = x.Student.Order,
                        Id = x.Student.Id,
                        FullName = x.Student.FullName,
                        Gender = x.Student.Gender,
                        Age = currentDate.Year - x.Student.DateOfBirthCalc.Year,
                        Package = x.ActiveCourse!.Package,
                        Level = x.ActiveCourse.Level,
                        Modality = x.ActiveCourse.Modality,
                        AcademicPeriod = x.ActiveCourse.AcademicPeriod,
                        Schedule = x.ActiveCourse.Schedule
                    })
                    .OrderBy(s => s.FullName);

                var result = await query.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active student list");
                throw;
            }
        }

        private string GenerateStudentID()
        {
            try
            {
                // Obter o último número de ordem ou 0 se não houver estudantes
                long lastOrder = _dbContext.StudentData
                        .OrderByDescending(s => s.Order)
                        .Select(s => s.Order)
                        .FirstOrDefault();

                // var lastOrde = _dbContext.Students
                //       .Max(s => (int?)s.Order) ?? 0;

                // Incrementar para o próximo ID
                long nextOrder = lastOrder + 1;

                // Formatar data atual como AAAAMM
                string year = $"{DateTime.Now.Year}";
                string month = $"{DateTime.Now.Month}";

                // Combinar todos os componentes (8 dígitos no total)
                string newId = $"ETC{year}{month}{nextOrder:D3}";

                return newId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Student ID.");

                // Retornar um fallback ou lançar exceção dependendo da sua necessidade
                throw new InvalidOperationException("Failed to generate Student ID.", ex);
            }
        }

        private string GenerateStudentCourseFeeID()
        {
            try
            {
                long lastOrder = _dbContext.StudentCourseFee
                        .OrderByDescending(s => s.Order)
                        .Select(s => s.Order)
                        .FirstOrDefault();
                        
                long nextOrder = lastOrder + 1;

                // Formatar data atual como AAAAMM
                string year = $"{DateTime.Now.Year}";
                string month = $"{DateTime.Now.Month}";

                // Combinar todos os componentes (8 dígitos no total)
                string newId = $"{year}{month}{nextOrder:D3}";

                return newId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Student ID.");

                // Retornar um fallback ou lançar exceção dependendo da sua necessidade
                throw new InvalidOperationException("Failed to generate Student ID.", ex);
            }
        }

        private decimal GetSettingsMonthlyTuition(string id, string packageName)
        {
            var tuitionId = _dbContext.SettingsMonthlyTuition.FirstOrDefault(s => s.Id == id);

            if (tuitionId is null) return 0;

            return packageName switch
            {
                "Intensive" => tuitionId.Intensive,
                "Private" => tuitionId.Private,
                "Regular" => tuitionId.Regular,
                _ => 0
            };
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

        private static string GetConvertCourse(string modality)
        {
            if (modality == "In-Person")
            { return "Presencial"; }
            else if (modality == "Online")
            { return "Online"; }
            else if (modality == "Morning")
            { return "Manhã"; }
            else if (modality == "Noon")
            { return "Tarde"; }
            else if (modality == "Evening")
            { return "Noite"; }
            else if (modality == "Intensive")
            { return "Intensivo"; }
            else if (modality == "Private")
            { return "Particular"; }
            else if (modality == "Regular")
            { return "Regular"; }

            return modality;
        }

    }
}