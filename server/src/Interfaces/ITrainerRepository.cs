/*
*@author Ramadan Ismael
*/

using System.Security.Claims;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface ITrainerRepository
    {
        Task<ResponseDto> Create(TrainerCreateDto trainerCreateDto);
        Task<IEnumerable<TrainerDetailsDto>> Details();
        Task<int> AnyDetails();
        Task<IEnumerable<TrainerDetailsSubsidyDto>> DetailsSubsidy();
        Task<ResponseDto> Update(TrainerUpdateDto trainerUpdateDto);
        Task<ResponseDto> UpdateSubsidy(TrainerUpdateSubsidyDto trainerUpdateSubsidyDto);
        Task<ResponseDto> UpdateProfileImage(ClaimsPrincipal userPrincipal, IFormFile file);

        Task<ResponseDto> DeleteProfileImage(string id);

        Task<ResponseDto> Delete(string id);
        Task<TrainerDetailsDto> Detail(ClaimsPrincipal userPrincipal);
        Task<ResponseDto> ValidateResetCode(ValidateResetCodeDto validateResetCodeDto);
        Task<ResponseDto> ForgotPassword(TrainerForgotPasswordDto forgotPasswordDto);
        Task<ResponseDto> SendNewCode(TrainerSendNewCodeDto sendNewCodeDto);
        Task<ResponseDto> ResetPassword(TrainerResetPasswordDto resetPasswordDto);
        Task<ResponseDto> ChangePassword(TrainerChangePasswordDto changePasswordDto);
    }
}