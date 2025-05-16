/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace server.src.Signalr
{
    [Authorize]
    public class NotificationHub : Hub
    {
      // Envia uma mensagem para todos os clientes conectados
      public async Task SendMessageToAll(string message)
      {
        await Clients.All.SendAsync("ReceiveMessage", message);
      }

      /*
      public async Task askServer(string someText)
      {
        string tempString;

        if(someText == "hey")
        {
          tempString = "message was 'hey'";
        }
        else
        {
          tempString = "message was something  else";
        }

        await Clients.Clients(Context.ConnectionId).SendAsync("askServerResponse", tempString);
      }
        private readonly ILogger<NotificationHub> _logger;
        
        public NotificationHub(ILogger<NotificationHub> logger) => _logger = logger;

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Unauthorized connection: {ConnectionId}", Context.ConnectionId);
                Context.Abort();
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            _logger.LogInformation("User connected: {UserId} (Connection: {ConnectionId})", userId, Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public async Task BroadcastUpdate(string updateType, object payload)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            await Clients.All.SendAsync($"Receive{updateType}Update", userId, payload);
            _logger.LogInformation("Broadcast: {UpdateType} update by {UserId}", updateType, userId);
        }

        public async Task SendToUser(string targetUserId, string updateType, object payload)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (senderId == null) return;

            await Clients.Group($"user-{targetUserId}").SendAsync($"Receive{updateType}Update", senderId, payload);
            _logger.LogInformation("Private: {UpdateType} sent from {SenderId} to {TargetUserId}", updateType, senderId, targetUserId);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
                _logger.LogInformation("User disconnected: {UserId} (Connection: {ConnectionId})", userId, Context.ConnectionId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }
        */
    }
}