/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IStudentPaymentRepository
    {
        Task<ResponseDto> Create(StudentPaymentCreateDto paymentCreateDto);
        Task<List<StudentPaymentModel>> Details();
        Task<string> GetStudentPaymentByLastId();
        Task<StudentPaymentModel> GetStudentPaymentById(string id);
        Task<decimal> GetPriceDueById(string id);        
    }
}