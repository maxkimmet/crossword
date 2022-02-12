using Microsoft.AspNetCore.SignalR;
using Crossword.Models;

namespace Crossword.Hubs;

public interface ICrosswordClient
{
    Task UpdateUrl(string gameId);
    Task JoinGame(string gameId);
    Task ClientMessage(string msg);
    Task RenderGrid(char[][] grid);
}

public class CrosswordHub : Hub<ICrosswordClient>
{
    // Map game IDs to games
    Dictionary<string, Game> GameIdToGame;
    // Map sessions to games
    Dictionary<string, Game> ConnectionToGame;
    // Map games to sessions
    Dictionary<string, List<string>> GameIdToConnections;

    public CrosswordHub()
    {
        this.GameIdToGame = new Dictionary<string, Game>();
        this.ConnectionToGame = new Dictionary<string, Game>();
        this.GameIdToConnections = new Dictionary<string, List<string>>();
    }

    public async Task CreateGame(string crosswordDate)
    {
        string gameId = Guid.NewGuid().ToString();
        Game game = new Game(gameId, crosswordDate);

        // Update dictionaries
        this.GameIdToGame[gameId] = game;
        this.ConnectionToGame[Context.ConnectionId] = game;
        this.GameIdToConnections[gameId] = new List<string> { Context.ConnectionId };

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Update client's URL
        await Clients.Client(Context.ConnectionId).UpdateUrl(gameId);
    }

    public async Task JoinGame(string gameId)
    {
        Game game = GameIdToGame[gameId];

        // Update dictionaries
        this.ConnectionToGame[Context.ConnectionId] = game;
        this.GameIdToConnections[game.Id].Add(Context.ConnectionId);

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
    }

    public async Task UpdateCell(int row, int col, char value)
    {
        Game game = this.ConnectionToGame[Context.ConnectionId];
        if (game.ActiveCrossword != null)
        {
            game.ActiveCrossword.grid![row][col] = value;
            await Clients.Group(game.Id).RenderGrid(game.ActiveCrossword.grid);
        }
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public async Task ServerMessage(string msg)
    {
        await Clients.Group("example_group_id").ClientMessage($"From server: {msg}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Game game = this.ConnectionToGame[Context.ConnectionId];

        // Remove player from group (group is automatically deleted if it has no connections)
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, game.Id);

        // Update dictionaries
        this.ConnectionToGame.Remove(Context.ConnectionId);
        this.GameIdToConnections[game.Id].Remove(Context.ConnectionId);
        if (this.GameIdToConnections[game.Id].Count == 0)
            this.GameIdToGame.Remove(game.Id);

        await base.OnDisconnectedAsync(exception);
    }
}
