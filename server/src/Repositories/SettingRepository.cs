/*
*@author Ramadan Ismael
*/

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
    public class SettingRepository : ISettingRepository
    {
        private readonly ServerDbContext _dbContext;
        private readonly ILogger<SettingRepository> _logger;

        public SettingRepository(ServerDbContext dbContext, ILogger<SettingRepository> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        // AcademicYear
        public async Task<ResponseDto> CreateAcademicYear()
        {
            try
            {
                for (int i = 1; i <= 2; i++)
                {

                    var academicYearData = new SettingsAcademicYearModel
                    {
                        Day = i,
                        Month = "January",
                        Year = 2025
                    };

                    await _dbContext.SettingsAcademicYear.AddAsync(academicYearData);
                    await _dbContext.SaveChangesAsync();
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Academic year created successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Academic Year.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating."
                };
            }
        }

        public async Task<List<SettingsAcademicYearModel>> DetailsAcademicYear()
        {
            var academicYear = await _dbContext.SettingsAcademicYear.AsNoTracking().ToListAsync();

            return [.. academicYear.Select(s => new SettingsAcademicYearModel
            {
                Id = s.Id,
                Day = s.Day,
                Month = s.Month,
                Year = s.Year
            }
            )];
        }

        public async Task<ResponseDto> UpdateAcademicYear(SettingsAcademicYearModel settingsAcademicYear)
        {
            try
            {
                var existId = await _dbContext.SettingsAcademicYear.FindAsync(settingsAcademicYear.Id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                existId.Day = settingsAcademicYear.Day;
                existId.Month = settingsAcademicYear.Month;
                existId.Year = settingsAcademicYear.Year;

                _dbContext.SettingsAcademicYear.Update(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Academic year updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Academic Year.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating."
                };
            }
        }

        public async Task<ResponseDto> DeleteAcademicYear(int id)
        {
            try
            {
                var existId = await _dbContext.SettingsAcademicYear.FindAsync(id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                _dbContext.SettingsAcademicYear.Remove(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Academic year deleted successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Academic Year.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting."
                };
            }
        }
        

        // AmountMt
        public async Task<ResponseDto> CreateAmountMt()
        {
            try
            {
                string[] description = ["CertificateFee", "EnrollmentFee", "ExamFee", "CourseFee", "Installments"];

                foreach (string descr in description)
                {
                    var amountMtData = new SettingsAmountMtModel
                    {
                        Id = descr,
                        AmountMT = 0,
                    };

                    await _dbContext.SettingsAmountMt.AddAsync(amountMtData);
                    await _dbContext.SaveChangesAsync();
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "AmountMT created successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating AmountMT.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating."
                };
            }
        }

        public async Task<List<SettingsAmountMtModel>> DetailsAmountMt()
        {
            var amountMT = await _dbContext.SettingsAmountMt.AsNoTracking().ToListAsync();

            return [.. amountMT.Select(s => new SettingsAmountMtModel
            {
                Id = s.Id,
                AmountMT = s.AmountMT
            }
            )];
        }

        public async Task<ResponseDto> UpdateAmountMt(SettingsAmountMtModel settingsAmountMt)
        {
            try
            {
                var existId = await _dbContext.SettingsAmountMt.FindAsync(settingsAmountMt.Id);
                if (existId is null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                existId.AmountMT = settingsAmountMt.AmountMT;

                _dbContext.SettingsAmountMt.Update(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "AmountMt updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating AmountMt.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating."
                };
            }
        }

        public async Task<ResponseDto> DeleteAmountMt(string id)
        {
            try
            {
                var existId = await _dbContext.SettingsAmountMt.FindAsync(id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                _dbContext.SettingsAmountMt.Remove(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "AmountMt deleted successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting AmountMt.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting."
                };
            }
        }


        // MonthlyTuition
        public async Task<ResponseDto> CreateMonthlyTuition()
        {
            try
            {
                string[] description = ["A1-In-Person", "A2-In-Person", "B1-In-Person", "B2-In-Person", "C1-In-Person", "C2-In-Person", "A1-Online", "A2-Online", "B1-Online", "B2-Online", "C1-Online", "C2-Online"];

                foreach (string descr in description)
                {
                    var monthlyData = new SettingsMonthlyTuitionModel
                    {
                        Id = descr,
                        Intensive = 0,
                        Private = 0,
                        Regular = 0,
                    };

                    await _dbContext.SettingsMonthlyTuition.AddAsync(monthlyData);
                    await _dbContext.SaveChangesAsync();
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Monthly Tuition created successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Monthly Tuition.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating."
                };
            }
        }

        public async Task<List<SettingsMonthlyTuitionModel>> DetailsMonthlyTuition()
        {
            var monthluTuition = await _dbContext.SettingsMonthlyTuition.AsNoTracking().ToListAsync();

            return [.. monthluTuition.Select(s => new SettingsMonthlyTuitionModel
            {
                Id = s.Id,
                Intensive = s.Intensive,
                Private = s.Private,
                Regular = s.Regular
            }
            )];
        }

        public async Task<ResponseDto> UpdateMonthlyTuition(SettingsMonthlyTuitionModel settingsMonthlyTuition)
        {
            try
            {
                var existId = await _dbContext.SettingsMonthlyTuition.FindAsync(settingsMonthlyTuition.Id);
                if (existId is null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                existId.Intensive = settingsMonthlyTuition.Intensive;
                existId.Private = settingsMonthlyTuition.Private;
                existId.Regular = settingsMonthlyTuition.Regular;
                

                _dbContext.SettingsMonthlyTuition.Update(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Monthly Tuition updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Monthly Tuition.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating."
                };
            }
        }

        public async Task<ResponseDto> DeleteMonthlyTuition(string id)
        {
            try
            {
                var existId = await _dbContext.SettingsMonthlyTuition.FindAsync(id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                _dbContext.SettingsMonthlyTuition.Remove(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Monthly Tuition deleted successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Monthly Tuition.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting."
                };
            }
        }


        // WeeklySchedule
        public async Task<ResponseDto> CreateWeeklySchedule(SettingsWeeklyScheduleCreateDto settingsWeeklySchedule)
        {
            try
            {
                var settingsWeeklyScheduleData = new SettingsWeeklyScheduleModel
                {
                    Monday = settingsWeeklySchedule.Monday,
                    Tuesday = settingsWeeklySchedule.Tuesday,
                    Wednesday = settingsWeeklySchedule.Wednesday,
                    Thursday = settingsWeeklySchedule.Thursday
                };

                await _dbContext.SettingsWeeklySchedule.AddAsync(settingsWeeklyScheduleData);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Weekly schedule created successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating weekly schedule.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while creating."
                };
            }
        }

        public async Task<List<SettingsWeeklyScheduleModel>> DetailsWeeklySchedule()
        {
            var weeklySchedule = await _dbContext.SettingsWeeklySchedule.AsNoTracking().ToListAsync();

            return [.. weeklySchedule.Select(s => new SettingsWeeklyScheduleModel
            {
                Id = s.Id,
                Monday = s.Monday,
                Tuesday = s.Tuesday,
                Wednesday = s.Wednesday,
                Thursday = s.Thursday
            }
            )];
        }

        public async Task<ResponseDto> UpdateWeeklySchedule(SettingsWeeklyScheduleModel settingsWeeklySchedule)
        {
            try
            {
                var existId = await _dbContext.SettingsWeeklySchedule.FindAsync(settingsWeeklySchedule.Id);
                if (existId is null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                existId.Monday = settingsWeeklySchedule.Monday;
                existId.Tuesday = settingsWeeklySchedule.Tuesday;
                existId.Wednesday = settingsWeeklySchedule.Wednesday;
                existId.Thursday = settingsWeeklySchedule.Thursday;

                _dbContext.SettingsWeeklySchedule.Update(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Weekly schedule updated successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Weekly schedule.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while updating."
                };
            }
        }

        public async Task<ResponseDto> DeleteWeeklySchedule(int id)
        {
            try
            {
                var existId = await _dbContext.SettingsWeeklySchedule.FindAsync(id);
                if (existId == null)
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Id not found."
                    };

                _dbContext.SettingsWeeklySchedule.Remove(existId);
                await _dbContext.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Weekly schedule deleted successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Weekly schedule.");
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while deleting."
                };
            }
        }


        // Get
        public async Task<decimal> GetSettingsMonthlyTuition(string id, string packageName)
        {
            var tuitionId = await _dbContext.SettingsMonthlyTuition.FirstOrDefaultAsync(s => s.Id == id);

            if (tuitionId is null) return 0;

            return packageName switch
            {
                "Intensive" => tuitionId.Intensive,
                "Private" => tuitionId.Private,
                "Regular" => tuitionId.Regular,
                _ => 0
            };
        }

        public async Task<decimal> GetAmount(string id)
        {
            var checkId = await _dbContext.SettingsAmountMt.FirstOrDefaultAsync(s => s.Id == id);

            if (checkId is null) return 0;

            return checkId.AmountMT;
        }
    }
}