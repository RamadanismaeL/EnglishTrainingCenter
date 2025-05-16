/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface ISettingRepository
    {
        // AcademicYear
        Task<ResponseDto> CreateAcademicYear();
        Task<List<SettingsAcademicYearModel>> DetailsAcademicYear();
        Task<ResponseDto> UpdateAcademicYear(SettingsAcademicYearModel settingsAcademicYear);
        Task<ResponseDto> DeleteAcademicYear(int id);

        // AmountMt
        Task<ResponseDto> CreateAmountMt();
        Task<List<SettingsAmountMtModel>> DetailsAmountMt();
        Task<ResponseDto> UpdateAmountMt(SettingsAmountMtModel settingsAmountMt);
        Task<ResponseDto> DeleteAmountMt(string id);

        // Monthly Tuition
        Task<ResponseDto> CreateMonthlyTuition();
        Task<List<SettingsMonthlyTuitionModel>> DetailsMonthlyTuition();
        Task<ResponseDto> UpdateMonthlyTuition(SettingsMonthlyTuitionModel settingsMonthlyTuition);
        Task<ResponseDto> DeleteMonthlyTuition(string id);

        // WeeklySchedule
        Task<ResponseDto> CreateWeeklySchedule(SettingsWeeklyScheduleCreateDto settingsWeeklySchedule);
        Task<List<SettingsWeeklyScheduleModel>> DetailsWeeklySchedule();
        Task<ResponseDto> UpdateWeeklySchedule(SettingsWeeklyScheduleModel settingsWeeklySchedule);
        Task<ResponseDto> DeleteWeeklySchedule(int id);

        // Get
        Task<decimal> GetSettingsMonthlyTuition(string id, string packageName);
        Task<decimal> GetAmount(string id);
    }
}