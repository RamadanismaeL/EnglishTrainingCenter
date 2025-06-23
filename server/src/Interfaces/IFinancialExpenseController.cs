/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface IFinancialExpenseController
    {
        Task<IActionResult> Create([FromBody] FinancialExpenseCreateDto financialExpenseCreateDto);
        Task<IActionResult> Update([FromBody] FinancialExpenseUpdateDto financialExpenseUpdateDto);
        Task<IActionResult> CancelStatus([FromRoute] long id);
        Task<ActionResult<List<FinancialExpenseListDto>>> GetListAllData();
        Task<IActionResult> CreatePending(FinancialExpenseCreatePendingDto financialExpenseCreatePendingDto);
        Task<ActionResult<List<FinancialExpenseListPendingDto>>> GetListPending();
        Task<IActionResult> Delete([FromRoute] long id);
        Task<IActionResult> PayNow([FromRoute] long id, string method);
        Task<ActionResult<List<FinancialExpenseListDto>>> GetListDailyReport();
    }
}