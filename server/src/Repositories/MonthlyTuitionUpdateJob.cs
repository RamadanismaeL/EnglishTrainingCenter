/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Quartz;
using server.src.Data;

namespace server.src.Repositories
{
    public class MonthlyTuitionUpdateJob(ILogger<MonthlyTuitionUpdateJob> logger,
    ServerDbContext dbContext)
    : IJob
    {
        private readonly ServerDbContext _dbContext = dbContext;
        private readonly ILogger<MonthlyTuitionUpdateJob> _logger = logger;

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("MonthlyTuitionUpdateJob started at {Time}", DateTime.Now);
            
            try
            {
                var now = DateTime.Now;
                var referenceMonthDate = new DateTime(now.Year, now.Month, 1);

                // Busca mensalidades pendentes do mês de referência
                var overdueTuitions = await _dbContext.StudentMonthlyTuition
                    .Where(m => m.ReferenceMonthDate == referenceMonthDate && 
                                m.Status == "Pending" && 
                                m.DueDate < now) // Vencidas
                    .ToListAsync();

                if (overdueTuitions.Count == 0)
                {
                    _logger.LogInformation("No pending tuitions found to mark as overdue.");
                    return;
                }

                // Atualiza o status para "Overdue"
                foreach (var tuition in overdueTuitions)
                {
                    tuition.Status = "Overdue";
                }

                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Marked {Count} tuitions as overdue at {Time}", overdueTuitions.Count, DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred in MonthlyTuitionJob at {Time}", DateTime.Now);
                throw;
            }
        }
    }
}