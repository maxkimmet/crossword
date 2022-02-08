using Microsoft.AspNetCore.SignalR;

namespace Crossword.Hubs;

public interface ICrosswordClient
{
    Task ClientMessage(string msg);
}

public class CrosswordHub : Hub<ICrosswordClient>
{
    public override async Task OnConnectedAsync()
    {
        string player = Guid.NewGuid().ToString();
        await Groups.AddToGroupAsync(Context.ConnectionId, "example_group_id");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // TODO: Delete unused sessions

        await base.OnDisconnectedAsync(exception);
    }

    public async Task ServerMessage(string msg)
    {
        await Clients.Group("example_group_id").ClientMessage($"From server: {msg}");
    }
}
