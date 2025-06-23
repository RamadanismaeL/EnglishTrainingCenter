/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.src.DTOs;
using server.src.Interfaces;
using server.src.Signalr;

namespace server.src.Controllers
{
    [Authorize]
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

            var response = await _expenseRepository.UpdateStatus(id, "Cancelled");

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Cancelled successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-list-all")]
        public async Task<ActionResult<List<FinancialExpenseListDto>>> GetListAllData()
        {
            var response = await _expenseRepository.GetListAllData();

            return Ok(response);
        }

        [HttpPost("create-pending")]
        public async Task<IActionResult> CreatePending([FromBody] FinancialExpenseCreatePendingDto financialExpenseCreatePendingDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.CreatePending(financialExpenseCreatePendingDto);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Pending and saved.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpGet("get-list-pending")]
        public async Task<ActionResult<List<FinancialExpenseListPendingDto>>> GetListPending()
        {
            var response = await _expenseRepository.GetListPending();

            return Ok(response);
        }

        [HttpPatch("pending-status/{id}")]
        public async Task<IActionResult> PendingStatus([FromRoute] long id)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.UpdateStatus(id, "Pending");

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Pending successfully.");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpPatch("paid-status/{id}/{method}")]
        public async Task<IActionResult> PayNow([FromRoute] long id, string method)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.PayNow(id, method);

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Payment confirmed");

            return response.IsSuccess ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] long id)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _expenseRepository.Delete(id);

            // Notifica todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Deleted successfully.");

            return response.IsSuccess ? Ok(response) : NotFound(response);
        }
        
        [HttpGet("get-list-daily-report")]
        public async Task<ActionResult<List<FinancialExpenseListDto>>> GetListDailyReport()
        {
            var response = await _expenseRepository.GetListDailyReport();

            return Ok(response);
        }
    }
}