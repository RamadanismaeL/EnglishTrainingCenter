/*
* Copyright 2025 | Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IFinancialExpenseRepository
    {
        Task<ResponseDto> Create(FinancialExpenseCreateDto financialExpenseCreateDto);
        Task<ResponseDto> Update(FinancialExpenseUpdateDto financialExpenseUpdateDto);
        Task<ResponseDto> CancelStatus(long id);
        Task<List<FinancialExpenseModel>> GetListAllData();
    }
}