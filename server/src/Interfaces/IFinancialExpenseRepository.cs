/*
* Copyright 2025 | Ramadan Ismael
*/

using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface IFinancialExpenseRepository
    {
        Task<ResponseDto> Create(FinancialExpenseCreateDto financialExpenseCreateDto);
        Task<ResponseDto> Update(FinancialExpenseUpdateDto financialExpenseUpdateDto);
        Task<ResponseDto> UpdateStatus(long id, string status);
        Task<List<FinancialExpenseListDto>> GetListAllData();
        Task<ResponseDto> CreatePending(FinancialExpenseCreatePendingDto financialExpenseCreatePendingDto);
        Task<List<FinancialExpenseListPendingDto>> GetListPending();
        Task<ResponseDto> Delete(long id);
        Task<ResponseDto> PayNow(long id, string method);

        Task<List<FinancialExpenseListDto>> GetListDailyReport();
    }
}