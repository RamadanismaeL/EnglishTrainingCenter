/*
*@author Ramadan Ismael
*/

namespace server.src.Interfaces
{
    public interface INotificationHub
    {
        Task OnConnectedAsync();
        Task SendMessage(string message);        
    }
}