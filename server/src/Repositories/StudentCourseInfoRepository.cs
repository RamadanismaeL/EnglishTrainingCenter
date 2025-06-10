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
            // 1. Authentication & Authorization
            var userPrincipal = _httpContextAccessor.HttpContext?.User;
            if (userPrincipal?.FindFirst(ClaimTypes.NameIdentifier) is not Claim userId)
            {
                return new ResponseDto { IsSuccess = false, Message = "User not authenticated." };
            }

            // 2. Database Context Setup
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            
            try
            {
                // 3. User Validation
                var user = await _dbContext.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);
                
                if (user is null)
                {
                    return new ResponseDto { IsSuccess = false, Message = "User not found." };
                }

                // 4. Deactivate Previous Levels (Critical Business Rule)
                var existingActiveCourses = await _dbContext.StudentCourseInfo
                    .Where(c => c.StudentId == studentCourseCreateDto.StudentId && c.CurrentLevel)
                    .ToListAsync();

                foreach (var course in existingActiveCourses)
                {
                    course.CurrentLevel = false;
                }

                // 5. Create New Course
                var newID = GenerateCourseId(studentCourseCreateDto.Level);
                if (string.IsNullOrEmpty(newID))
                {
                    return new ResponseDto { IsSuccess = false, Message = "Invalid course ID generation." };
                }

                var trainerName = userPrincipal.FindFirst(JwtRegisteredClaimNames.Name)?.Value 
                    ?? "System Generated";

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
                    MonthlyFee = GetSettingsMonthlyTuition(
                        $"{studentCourseCreateDto.Level}-{studentCourseCreateDto.Modality}", 
                        studentCourseCreateDto.Package),
                    QuizOne = 0.0M,
                    QuizTwo = 0.0M,
                    Exam = 0.0M,
                    FinalAverage = 0.0M,
                    Status = "In Progress",
                    CurrentLevel = true, // Only this record will be true
                    TrainerName = trainerName
                };

                // 6. Schedule Exam
                var courseInfoScheduleExamData = new StudentCourseInfoScheduleExamModel
                {
                    CourseInfoId = newID,
                    Status = "Unscheduled"
                };

                // 7. Atomic Operations
                await _dbContext.StudentCourseInfo.AddAsync(courseInfoData);
                await _dbContext.StudentCourseInfoScheduleExam.AddAsync(courseInfoScheduleExamData);
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                /* 8. Audit Trail (Recommended)
                _logger.LogInformation("Course {CourseId} created for student {StudentId}", 
                    newID, studentCourseCreateDto.StudentId);
                    */

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Course created successfully."
                };
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                _logger.LogError(dbEx, "Database error creating course");
                return new ResponseDto { IsSuccess = false, Message = "Database operation failed." };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "System error creating course");
                return new ResponseDto { IsSuccess = false, Message = "System error processing request." };
            }
        }

        public async Task<ResponseDto> Update(StudentCourseInfoUpdateDto studentCourseUpdateDto)
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

                if (studentCourseUpdateDto.StudentId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Student not found."
                    };
                }

                var studentData = await _dbContext.StudentData
                .Include(s => s.CourseInfo) // Ensure CourseInfo is loaded
                .FirstOrDefaultAsync(s => s.Id == studentCourseUpdateDto.StudentId);

                if (studentData == null || studentData.Status != "Active")
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Student not found or not active."
                    };
                }

                var inProgressCourse = studentData.CourseInfo?
                    .FirstOrDefault(c => c.Status == "In Progress");

                if (inProgressCourse == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No course in progress found for student."
                    };
                }

                // Assuming Order is the primary key you want to look up
                var checkCourse = await _dbContext.StudentCourseInfo.FindAsync(inProgressCourse.Order);
                if (checkCourse is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course ID not found."
                    };
                }

                //Console.WriteLine($"Course Order = {checkCourse.Order}");

                checkCourse.Package = studentCourseUpdateDto.Package;
                checkCourse.Modality = studentCourseUpdateDto.Modality;
                checkCourse.AcademicPeriod = studentCourseUpdateDto.AcademicPeriod;
                checkCourse.Schedule = studentCourseUpdateDto.Schedule;
                checkCourse.TrainerName = trainerName!;
                checkCourse.DateUpdate = DateTime.Now;
                    
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

        public async Task<StudentCourseInfoUpdateListDto> GetStudentCourseInfoUpdateListById(string studentId)
        {
            var student = await _dbContext.StudentCourseInfo
                .AsNoTracking()
                .Where(s => s.StudentId == studentId && s.Status == "In Progress")
                .Select(x => new StudentCourseInfoUpdateListDto
                {
                    Package = x.Package,
                    Modality = x.Modality,
                    AcademicPeriod = x.AcademicPeriod,
                    Schedule = x.Schedule,                    
                })
                .FirstOrDefaultAsync();

            return student!;
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

                courseId.QuizOne = courseInfoUpdateQuizDto.QuizOne;
                courseId.QuizTwo = courseInfoUpdateQuizDto.QuizTwo;
                courseId.Exam = courseInfoUpdateQuizDto.Exam;
                courseId.TrainerName = trainerName!;
                courseId.DateUpdate = DateTime.Now;
                
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

        public async Task<ResponseDto> UpdateQuizOneTwo(StudentCourseInfoUpdateQuizOneTwoDto courseInfoUpdateQuizDto)
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

                courseId.QuizOne = courseInfoUpdateQuizDto.QuizOne;
                courseId.QuizTwo = courseInfoUpdateQuizDto.QuizTwo;
                courseId.TrainerName = trainerName!;
                courseId.DateUpdate = DateTime.Now;
                
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

        public async Task<ResponseDto> CancelStatus(long order)
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

                var courseId = await _dbContext.StudentCourseInfo.FindAsync(order);
                if (courseId is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course ID not found."
                    };
                }

                courseId.IsCancelled = true;
                courseId.TrainerName = trainerName!;
                courseId.DateUpdate = DateTime.Now;
                
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

        public async Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoActive()
        {
            try
            {
                var query = _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Active")
                    .Select(s => new
                    {
                        Student = s,
                        ActiveCourse = s.CourseInfo!.FirstOrDefault(c => c.CurrentLevel == true)
                    })
                    .Where(x => x.ActiveCourse != null)
                    .Select(x => new StudentCourseInfoListDto
                    {
                        Order = x.ActiveCourse!.Order,
                        Id = x.Student.Id,
                        FullName = x.Student.FullName,
                        Level = x.ActiveCourse.Level,
                        Schedule = x.ActiveCourse.Schedule,
                        QuizOne = x.ActiveCourse.QuizOne,
                        QuizTwo = x.ActiveCourse.QuizTwo,
                        Exam = x.ActiveCourse.Exam,
                        FinalAverage = x.ActiveCourse.FinalAverage,
                        Status = x.ActiveCourse.Status
                    })
                    .OrderBy(s => s.Level)
                    .ThenBy(s => s.FullName);

                var result = await query.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active student list");
                throw;
            }
        }

        public async Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoCompleted()
        {
            try
            {
                var query = _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Completed")
                    .Select(s => new
                    {
                        Student = s,
                        ActiveCourse = s.CourseInfo!.FirstOrDefault(c => c.CurrentLevel == true)
                    })
                    .Where(x => x.ActiveCourse != null)
                    .Select(x => new StudentCourseInfoListDto
                    {
                        Order = x.ActiveCourse!.Order,
                        Id = x.Student.Id,
                        FullName = x.Student.FullName,
                        Level = x.ActiveCourse.Level,
                        Schedule = x.ActiveCourse.Schedule,
                        QuizOne = x.ActiveCourse.QuizOne,
                        QuizTwo = x.ActiveCourse.QuizTwo,
                        Exam = x.ActiveCourse.Exam,
                        FinalAverage = x.ActiveCourse.FinalAverage,
                        Status = x.ActiveCourse.Status
                    })
                    .OrderBy(s => s.Level)
                    .ThenBy(s => s.FullName);

                var result = await query.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active student list");
                throw;
            }
        }

        public async Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoInactive()
        {
            try
            {
                var query = _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Inactive")
                    .Select(s => new
                    {
                        Student = s,
                        ActiveCourse = s.CourseInfo!.FirstOrDefault(c => c.CurrentLevel == true)
                    })
                    .Where(x => x.ActiveCourse != null)
                    .Select(x => new StudentCourseInfoListDto
                    {
                        Order = x.ActiveCourse!.Order,
                        Id = x.Student.Id,
                        FullName = x.Student.FullName,
                        Level = x.ActiveCourse.Level,
                        Schedule = x.ActiveCourse.Schedule,
                        QuizOne = x.ActiveCourse.QuizOne,
                        QuizTwo = x.ActiveCourse.QuizTwo,
                        Exam = x.ActiveCourse.Exam,
                        FinalAverage = x.ActiveCourse.FinalAverage,
                        Status = x.ActiveCourse.Status
                    })
                    .OrderBy(s => s.Level)
                    .ThenBy(s => s.FullName);

                var result = await query.ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active student list");
                throw;
            }
        }

        public async Task<List<StudentCourseInfoProgressHistoryDto>> GetListStudentCourseInfoProgressHistory(string studentId)
        {
            if (string.IsNullOrWhiteSpace(studentId))
                throw new ArgumentException("Student ID cannot be empty.", nameof(studentId));

            try
            {
                var courseInfo = await _dbContext.StudentCourseInfo // Query CourseInfo directly (more efficient)
                    .AsNoTracking()
                    .Where(c => c.StudentId == studentId) // Assuming StudentDataId is the FK
                    .OrderBy(c => c.Level)
                    .ThenBy(c => c.DateRegister)
                    .Select(c => new StudentCourseInfoProgressHistoryDto
                    {
                        Order = c.Order,
                        FullName = c.StudentData != null ? c.StudentData.FullName : "N/A",
                        Level = c.Level,
                        QuizOne = c.QuizOne,
                        QuizTwo = c.QuizTwo,
                        Exam = c.Exam,
                        FinalAverage = c.FinalAverage,
                        Status = c.Status,
                        DateUpdate = c.DateUpdate != null ? c.DateUpdate.Value.ToString("dd/MM/yyyy") : ""
                    })
                    .ToListAsync();

                return courseInfo; // Nullable return (caller handles null)
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course progress history for Student ID: {StudentId}", studentId);
                throw;
            }
        }

        public async Task<List<StudentUnscheduledExamsDto>> GetListStudentUnscheduledExams()
        {
            try
            {
                var result = await _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Active")
                    .SelectMany(s => s.CourseInfo!
                        .Where(c =>
                            c.CurrentLevel == true &&
                            c.CourseInfoScheduleExamData != null &&
                            c.CourseInfoScheduleExamData.Status == "Unscheduled" &&
                            c.CourseInfoScheduleExamData.IsScheduled == false
                            )
                        .Select(c => new StudentUnscheduledExamsDto
                        {
                            IdScheduleExam = c.CourseInfoScheduleExamData!.CourseInfoId,
                            FullName = s.FullName,
                            Gender = s.Gender,
                            Package = c.Package,
                            Level = c.Level,
                            Modality = c.Modality,
                            AcademicPeriod = c.AcademicPeriod,
                            Schedule = c.Schedule,
                            Status = c.CourseInfoScheduleExamData!.Status
                        }))
                    .OrderBy(x => x.Level)
                    .ThenBy(x => x.FullName)
                    .ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student unscheduled exams list");
                throw;
            }
        }

        public async Task<ResponseDto> UpdateStudentUnScheduledExams(List<string>? IdScheduleExam)
        {
            try
            {
                foreach (var examId in IdScheduleExam!)
                {
                    var examData = await _dbContext.StudentCourseInfoScheduleExam.FindAsync(examId);
                    if (examData == null)
                    {
                        return new ResponseDto
                        {
                            IsSuccess = false,
                            Message = "ExamId ID not found."
                        };
                    }

                    examData.IsScheduled = true;
                    examData.Status = "Scheduled";
                    
                    await _dbContext.SaveChangesAsync();
                }

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

        public async Task<List<StudentScheduleExamsDto>> GetListStudentScheduledExams()
        {
            try
            {
                var result = await _dbContext.StudentData
                    .AsNoTracking()
                    .Where(s => s.Status == "Active")
                    .SelectMany(s => s.CourseInfo!
                        .Where(c =>
                            c.CurrentLevel == true &&
                            c.CourseInfoScheduleExamData != null &&
                            c.CourseInfoScheduleExamData.Status == "Scheduled" &&
                            c.CourseInfoScheduleExamData.IsScheduled == true
                            )
                        .Select(c => new StudentScheduleExamsDto
                        {
                            Id = c.CourseInfoScheduleExamData!.CourseInfoId,
                            FullName = s.FullName,
                            Level = c.Level,
                            Schedule = c.Schedule,
                            QuizOne = c.QuizOne,
                            QuizTwo = c.QuizTwo,
                            Exam = c.Exam,
                            FinalAverage = c.FinalAverage,
                            Status = c.Status
                        }))
                    .OrderBy(x => x.Level)
                    .ThenBy(x => x.FullName)
                    .ToListAsync();

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student unscheduled exams list");
                throw;
            }
        }

        public async Task<ResponseDto> UpdateStudentScheduledExams(string Id, decimal exam)
        {
            try
            {
                var checkOrderCourseInfo = await _dbContext.StudentCourseInfo.FirstOrDefaultAsync(c => c.Id == Id);

                if (checkOrderCourseInfo is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course ID not found."
                    };
                }

                var orderCourseInfo = checkOrderCourseInfo?.Order;


                var courseInfo = await _dbContext.StudentCourseInfo.FindAsync(orderCourseInfo);
                if (courseInfo is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course not found."
                    };
                }

                courseInfo.Exam = exam;
                courseInfo.DateUpdate = DateTime.Now;
                
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Exam updated successfuly."
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

        public async Task<ResponseDto> CancelStudentScheduledExams(string Id)
        {
            try
            {
                var checkOrderCourseInfo = await _dbContext.StudentCourseInfo.FirstOrDefaultAsync(c => c.Id == Id);

                if (checkOrderCourseInfo is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course ID not found."
                    };
                }

                var orderCourseInfo = checkOrderCourseInfo?.Order;


                var courseInfo = await _dbContext.StudentCourseInfo.FindAsync(orderCourseInfo);
                if (courseInfo is null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Course not found."
                    };
                }

                courseInfo.Exam = 0.0M;
                courseInfo.DateUpdate = DateTime.Now;

                var examData = await _dbContext.StudentCourseInfoScheduleExam.FindAsync(Id);
                if (examData == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "ExamId ID not found."
                    };
                }

                examData.IsScheduled = false;
                examData.Status = "Unscheduled";

                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Scheduled exam cancelled successfully.."
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