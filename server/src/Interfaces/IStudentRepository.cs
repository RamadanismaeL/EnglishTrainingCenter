/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentRepository
    {
        Task<ResponseDto> Create(StudentCreateDto studentCreateDto);
        Task<ResponseDto> Update(StudentUpdateDto studentUpdateDto);
        Task<ResponseDto> UpdateStatus(List<long> order, string status);
        Task<List<StudentDataModel>> DetailStudentData();
        Task<List<StudentEnrollmentFormModel>> DetailStudentEnrollmentForm();
        Task<string> GetStudentByLastId();
        Task<string> GetStudentCourseFeeByLastId();
        Task<IEnumerable<StudentCourseFeeModel>> GetStudentListCourseFee();
        Task<StudentEnrollmentFormModel> GetStudentEnrollmentFormById(string id);
        Task<StudentDataModel> GetStudentDataByName(string fullName);
        Task<StudentUpdateDto> GetStudentListProfileEditById(string id);
        Task<StudentListProfileDto> GetStudentListProfileById(string id);
        Task<StudentListProfileEnrollmentDto> GetStudentListProfileEnrollmentById(string id);
        Task<IEnumerable<ListStudentActiveDto>> GetListStudentActive();
        Task<IEnumerable<ListStudentActiveDto>> GetListStudentCompleted();
        Task<IEnumerable<ListStudentActiveDto>> GetListStudentInactive();
        Task<IEnumerable<StudentBalanceList>> GetListStudentBalance();     
        Task<List<StudentBalanceTransactionsDto>> GetTransactionsByStudentId(string id); 
    }
}