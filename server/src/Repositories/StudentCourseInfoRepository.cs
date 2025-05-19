/*
*@author Ramadan Ismael
*/

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.src.Data;
using server.src.DTOs;

/*
*@author Ramadan Ismael
*/

using server.src.Interfaces;
using server.src.Models;

namespace server.src.Repositories
{
    public class StudentCourseInfoRepository(ServerDbContext dbContext, ILogger<StudentCourseInfoRepository> logger, IHttpContextAccessor httpContextAccessor) : IStudentCourseInfoRepository
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<StudentCourseInfoRepository> _logger = logger;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

        public async Task<ResponseDto> Create(StudentCourseInfoCreateDto studentCourseCreateDto)
        {
            try
            {
                var userPrincipal = _httpContextAccessor.HttpContext?.User;
                if (userPrincipal is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }

                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier);
                if (userId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userIdValue = userId.Value;
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userIdValue);
                if (user is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var usernameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var trainerName = usernameClaim?.Value;

                var newID = GenerateCourseId(studentCourseCreateDto.Level);
                if (newID is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Failed to generate a new Student ID."
                    };
                }

                decimal monthlyFee = GetSettingsMonthlyTuition($"{studentCourseCreateDto.Level}-{studentCourseCreateDto.Modality}", $"{studentCourseCreateDto.Package}");

                var courseInfoData = new StudentCourseInfoModel
                {
                    Id = newID,
                    StudentId = studentCourseCreateDto.StudentId,
                    CourseName = "Inglês",
                    Package = studentCourseCreateDto.Package,
                    Level = studentCourseCreateDto.Level,
                    Modality = studentCourseCreateDto.Modality,
                    AcademicPeriod = studentCourseCreateDto.AcademicPeriod,
                    Schedule = studentCourseCreateDto.Schedule,
                    Duration = "3 Meses",
                    MonthlyFee = monthlyFee,
                    QuizOne = 0.0M,
                    QuizTwo = 0.0M,
                    Exam = 0.0M,
                    FinalAverage = 0.0M,
                    Status = "In Progress",
                    TrainerName = trainerName!,
                    DateUpdate = DateTime.Now
                };

                await _dbContext.StudentCourseInfo.AddAsync(courseInfoData);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Course created successfuly."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create course.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to create course."
                };
            }
        }

        public async Task<List<StudentCourseInfoModel>> Details()
        {
            var courseData = await _dbContext.StudentCourseInfo.AsNoTracking().ToListAsync();

            return [.. courseData.OrderBy(c => c.Level)];
        }

        public async Task<ResponseDto> UpdateQuiz(StudentCourseInfoUpdateQuizDto courseInfoUpdateQuizDto)
        {
            try
            {
                var userPrincipal = _httpContextAccessor.HttpContext?.User;
                if (userPrincipal is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not authenticated."
                    };
                }

                var userId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier);
                if (userId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var userIdValue = userId.Value;
                var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userIdValue);
                if (user is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                var usernameClaim = _httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Name);

                var trainerName = usernameClaim?.Value;

                var courseId = await _dbContext.StudentCourseInfo.FindAsync(courseInfoUpdateQuizDto.Order);
                if (courseId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course ID not found."
                    };
                }
                
                decimal finalAverage = 
                (((courseInfoUpdateQuizDto.QuizOne + courseInfoUpdateQuizDto.QuizTwo) / 2) * 0.6M) + (courseInfoUpdateQuizDto.Exam * 0.4M);

                string status = "";
                if (courseInfoUpdateQuizDto.Exam == 0.0M)
                { status = "In Progress"; }
                else
                {
                    if (finalAverage >= 0.0M && finalAverage < 50.0M)
                    { status = "Failed"; }
                    else if (finalAverage >= 50.0M && finalAverage <= 100.0M)
                    { status = "Pass"; }
                    else
                    { status = "Error"; }
                }

                courseId.QuizOne = courseInfoUpdateQuizDto.QuizOne;
                courseId.QuizTwo = courseInfoUpdateQuizDto.QuizTwo;
                courseId.Exam = courseInfoUpdateQuizDto.Exam;
                courseId.FinalAverage = finalAverage;
                courseId.Status = status;
                courseId.TrainerName = trainerName!;
                courseId.DateUpdate = DateTime.Now;
                
                _dbContext.StudentCourseInfo.Update(courseId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Course updated successfuly."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update course.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to update course."
                };
            }
        }

        private string GenerateCourseId(string level)
        {
            try
            {
                long lastOrder = _dbContext.StudentCourseInfo
                    .OrderByDescending(c => c.Order)
                    .Select(c => c.Order)
                    .FirstOrDefault();

                long nextOrder = lastOrder + 1;

                string year = $"{DateTime.Now.Year}";
                string month = $"{DateTime.Now.Month}";

                string newId = $"{level}{year}{month}{nextOrder:D2}";

                return newId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate Course ID.");
                throw new InvalidOperationException("Failed to generate Course ID.");
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
    }
}