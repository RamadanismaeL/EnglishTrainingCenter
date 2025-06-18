/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentMonthlyTuitionRepository
    {
        Task<ResponseDto> Create(string studentID);
        Task<IEnumerable<StudentMonthlyTuitionModel>> GetAllMonthlyTuition();

        Task<ResponseDto> Update(StudentMonthlyTuitionUpdateDto monthlyTuitionUpdateDto);
        Task<ResponseDto> UpdateStatusMonthly(long order, string status);

        Task<List<MonthlyTuitionPaymentListDto>> GetMonthlyTuitionPaymentList();
    }
}