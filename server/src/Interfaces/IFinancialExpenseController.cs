/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IFinancialExpenseController
    {
        Task<IActionResult> Create([FromBody] FinancialExpenseCreateDto financialExpenseCreateDto);
        Task<IActionResult> Update([FromBody] FinancialExpenseUpdateDto financialExpenseUpdateDto);
        Task<IActionResult> CancelStatus([FromRoute] long id);
        Task<ActionResult<List<FinancialExpenseModel>>> GetListAllData();
    }
}