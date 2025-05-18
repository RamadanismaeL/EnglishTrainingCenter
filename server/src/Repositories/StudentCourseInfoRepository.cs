/*
*@author Ramadan Ismael
*/

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
                { }                   
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

        public Task<List<StudentCourseInfoModel>> Details()
        {
            throw new NotImplementedException();
        }

        public Task<StudentCourseInfoModel> GetStudentCourseById(string id)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetStudentCourseByLastId()
        {
            throw new NotImplementedException();
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