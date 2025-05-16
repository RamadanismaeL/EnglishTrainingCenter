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
        Task<List<StudentCourseInfoModel>> DetailStudentCourseInfo();
        Task<List<StudentEnrollmentFormModel>> DetailStudentEnrollmentForm();
        Task<string> GetStudentByLastId();
        Task<StudentEnrollmentFormModel> GetStudentEnrollmentFormById(string id);
    }
}