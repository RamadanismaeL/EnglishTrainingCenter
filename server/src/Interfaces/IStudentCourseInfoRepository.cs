/*
@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentCourseInfoRepository
    {
        Task<ResponseDto> Create(StudentCourseInfoCreateDto studentCourseCreateDto);
        Task<List<StudentCourseInfoModel>> Details();
        Task<string> GetStudentCourseByLastId();
        Task<StudentCourseInfoModel> GetStudentCourseById(string id);
    }
}