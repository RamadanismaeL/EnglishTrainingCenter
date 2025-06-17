/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentMonthlyTuitionRepository
    {
        Task<ResponseDto> Create(StudentMonthlyTuitionCreateDto monthlyTuitionCreateDto);
        Task<IEnumerable<StudentMonthlyTuitionModel>> GetAllMonthlyTuition();

        Task<ResponseDto> Update(StudentMonthlyTuitionUpdateDto monthlyTuitionUpdateDto);
        Task<ResponseDto> CancelStatus(long order);

        Task<List<MonthlyTuitionPaymentListDto>> GetMonthlyTuitionPaymentList();
    }
}