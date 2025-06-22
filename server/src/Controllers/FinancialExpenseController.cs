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

        [HttpPatch("update")]
        public async Task<IActionResult> Update([FromBody] FinancialExpenseUpdateDto financialExpenseUpdateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.Update(financialExpenseUpdateDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Approved and updated.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("cancel-status/{id}")]
        public async Task<IActionResult> CancelStatus([FromRoute] long id)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.CancelStatus(id);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Cancelled successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-list-all")]
        public async Task<ActionResult<List<FinancialExpenseListDto>>> GetListAllData()
        {
            var response = await _expenseRepository.GetListAllData();

            return Ok(response);
        }
    }
}