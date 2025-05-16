/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface ITrainerController
    {
        Task<IActionResult> Create([FromForm] TrainerCreateDto trainerCreateDto);
        Task<ActionResult<IEnumerable<TrainerDetailsDto>>> Details();
        Task<IActionResult> AnyDetails();
        Task<ActionResult<IEnumerable<TrainerDetailsSubsidyDto>>> DetailsSubsidy();
        Task<IActionResult> Update([FromForm] TrainerUpdateDto trainerUpdateDto);
        Task<IActionResult> UpdateSubsidy([FromBody] TrainerUpdateSubsidyDto trainerUpdateSubsidyDto);
        Task<IActionResult> UpdateProfileImage(IFormFile file);
        Task<IActionResult> DeleteProfileImage(string id);
        Task<IActionResult> Delete(string id);
        Task<ActionResult<TrainerDetailsDto>> Detail();
        Task<IActionResult> ValidateResetCode(ValidateResetCodeDto validateResetCodeDto);
        Task<IActionResult> ForgotPassword(TrainerForgotPasswordDto forgotPasswordDto);
        Task<IActionResult> SendNewCode(TrainerSendNewCodeDto sendNewCodeDto);
        Task<IActionResult> ResetPassword(TrainerResetPasswordDto resetPasswordDto);
        Task<IActionResult> ChangePassword (TrainerChangePasswordDto changePasswordDto);
    }
}