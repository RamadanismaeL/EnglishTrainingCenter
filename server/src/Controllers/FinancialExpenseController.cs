/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Models;
using server.src.Signalr;

namespace server.src.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialExpenseController(IFinancialExpenseRepository expenseRepository, IHubContext<NotificationHub> hubContext) : ControllerBase, IFinancialExpenseController
    {
        private readonly IFinancialExpenseRepository _expenseRepository = expenseRepository;
        private readonly IHubContext<NotificationHub> _hubContext = hubContext;
        
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] FinancialExpenseCreateDto financialExpenseCreateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.Create(financialExpenseCreateDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Approved and saved.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        public Task<IActionResult> Update([FromBody] FinancialExpenseUpdateDto financialExpenseUpdateDto)
        {
            throw new NotImplementedException();
        }

        public Task<IActionResult> CancelStatus([FromRoute] long id)
        {
            throw new NotImplementedException();
        }

        public Task<ActionResult<List<FinancialExpenseModel>>> GetListAllData()
        {
            throw new NotImplementedException();
        }
    }
}