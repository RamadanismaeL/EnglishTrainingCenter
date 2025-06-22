/*
* Copyright 2025 | Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.src.Data;

namespace server.src.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly ServerDbContext _dbContext;

        public SetupController(ServerDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("migrate")]
        public async Task<IActionResult> MigrateDatabase()
        {
            try
            {
                await _dbContext.Database.MigrateAsync();
                return Ok(new { message = "Migration completed successfully!" });
            }
            catch (Exception ex)
            {
                 return BadRequest(new { error = $"Error migrating database: {ex.Message}" });
            }
        }

        [HttpGet("check-db")]
        public async Task<IActionResult> CheckDatabaseExists()
        {
            try
            {
                bool exists = await _dbContext.Database.CanConnectAsync();
                return Ok(new { exists });
            }
            catch
            {
                return Ok(new { exists = false });
            }
        }
    }
}