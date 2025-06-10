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
        Task<ResponseDto> Update(StudentCourseInfoUpdateDto studentCourseUpdateDto);
        Task<StudentCourseInfoUpdateListDto> GetStudentCourseInfoUpdateListById(string id);
        Task<List<StudentCourseInfoModel>> Details();
        Task<ResponseDto> UpdateQuiz(StudentCourseInfoUpdateQuizDto courseInfoUpdateQuizDto);
        Task<ResponseDto> UpdateQuizOneTwo(StudentCourseInfoUpdateQuizOneTwoDto courseInfoUpdateQuizDto);
        Task<ResponseDto> CancelStatus(long order);
        //Task<ResponseDto> UpdateQuizExam(StudentCourseInfoUpdateExamDto courseInfoUpdateQuizDto);
        Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoActive();
        Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoCompleted();
        Task<List<StudentCourseInfoListDto>> GetListStudentCourseInfoInactive();
        Task<List<StudentCourseInfoProgressHistoryDto>> GetListStudentCourseInfoProgressHistory(string studentId);
        Task<List<StudentUnscheduledExamsDto>> GetListStudentUnscheduledExams();
        Task<ResponseDto> UpdateStudentUnScheduledExams(List<string>? IdScheduleExam);
        Task<List<StudentScheduleExamsDto>> GetListStudentScheduledExams();
        Task<ResponseDto> UpdateStudentScheduledExams(string Id, decimal exam);
        Task<ResponseDto> CancelStudentScheduledExams(string Id);
    }
}