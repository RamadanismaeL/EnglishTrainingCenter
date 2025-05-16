/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface ISettingsController
    {
        // AcademicYear
        Task<IActionResult> CreateAcademicYear();
        Task<ActionResult<List<SettingsAcademicYearModel>>> DetailsAcademicYear();
        Task<IActionResult> UpdateAcademicYear(SettingsAcademicYearModel settingsAcademicYear);
        Task<IActionResult> DeleteAcademicYear(int id);


        // AmountMt
        Task<IActionResult> CreateAmountMt();
        Task<ActionResult<List<SettingsAmountMtModel>>> DetailsAmountMt();
        Task<IActionResult> UpdateAmountMt(SettingsAmountMtModel settingsAmountMt);
        Task<IActionResult> DeleteAmountMt(string id);


        // Monthly Tuition
        Task<IActionResult> CreateMonthlyTuition();
        Task<ActionResult<List<SettingsMonthlyTuitionModel>>> DetailsMonthlyTuition();
        Task<IActionResult> UpdateMonthlyTuition(SettingsMonthlyTuitionModel settingsMonthlyTuition);
        Task<IActionResult> DeleteMonthlyTuition(string id);


        // WeeklySchedule
        Task<IActionResult> CreateWeeklySchedule(SettingsWeeklyScheduleCreateDto settingsWeeklySchedule);
        Task<ActionResult<List<SettingsWeeklyScheduleModel>>> DetailsWeeklySchedule();
        Task<IActionResult> UpdateWeeklySchedule(SettingsWeeklyScheduleModel settingsWeeklySchedule);
        Task<IActionResult> DeleteWeeklySchedule(int id);

        // Get
        Task<ActionResult<decimal>> GetSettingsMonthlyTuition(string id, string packageName);
        Task<ActionResult<decimal>> GetAmount(string id);
    }
}