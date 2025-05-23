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
        Task<List<StudentDataModel>> DetailStudentData();
        Task<List<StudentEnrollmentFormModel>> DetailStudentEnrollmentForm();
        //Task<List<StudentDataModel>> DetailStudentCourseInProgress();
        Task<string> GetStudentByLastId();
        Task<string> GetStudentCourseFeeByLastId();
        Task<IEnumerable<StudentCourseFeeModel>> GetStudentListCourseFee();
        Task<StudentEnrollmentFormModel> GetStudentEnrollmentFormById(string id);
        Task<StudentDataModel> GetStudentDataByName(string fullName);
        Task<IEnumerable<StudentListPrincipalViewDto>> GetStudentListPrincipalViewActive();        
    }
}