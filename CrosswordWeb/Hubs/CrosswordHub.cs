using Microsoft.AspNetCore.SignalR;
using Crossword.Models;

namespace Crossword.Hubs;

public interface ICrosswordClient
{
    Task UpdateUrl(string gameId);
    Task RenderGrid(char[][] grid, bool[][] errors);
}

public class CrosswordHub : Hub<ICrosswordClient>
{
    private IGameRepository _gameRepository;

    public CrosswordHub(IGameRepository gameRepository)
    {
        this._gameRepository = gameRepository;
    }

    public async Task CreateGame(string crosswordDate)
    {
        string gameId = Guid.NewGuid().ToString();  // TODO: Ensure ID is unique before creating game
        Game game = new Game(gameId, crosswordDate);

        // Update dictionaries
        Console.WriteLine(gameId);
        this._gameRepository.GameIdToGame[gameId] = game;
        Console.WriteLine(this._gameRepository.GameIdToGame.Count);
        this._gameRepository.ConnectionToGame[Context.ConnectionId] = game;
        this._gameRepository.GameIdToConnections[gameId] = new List<string> { Context.ConnectionId };

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Update client's URL
        await Clients.Client(Context.ConnectionId).UpdateUrl(gameId);
    }

    public async Task JoinGame(string gameId)
    {
        Console.WriteLine(this._gameRepository.GameIdToGame.Count);

        Game game = this._gameRepository.GameIdToGame[gameId];

        // Update dictionaries
        this._gameRepository.ConnectionToGame[Context.ConnectionId] = game;
        this._gameRepository.GameIdToConnections[game.Id].Add(Context.ConnectionId);

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
    }

    public async Task UpdateCell(int row, int col, char value)
    {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];
        if (game.ActiveCrossword != null)
        {
            game.ActiveCrossword.grid![row][col] = value;
            game.ActiveCrossword.errors![row][col] = false;
            await Clients.Group(game.Id).RenderGrid(game.ActiveCrossword.grid, game.ActiveCrossword.errors);
        }
    }

    public async Task UpdateGrid() {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];
        await Clients.Group(game.Id).RenderGrid(game.ActiveCrossword.grid, game.ActiveCrossword.errors);
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];

        // Remove player from group (group is automatically deleted if it has no connections)
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, game.Id);

        // Update dictionaries
        this._gameRepository.ConnectionToGame.Remove(Context.ConnectionId);
        this._gameRepository.GameIdToConnections[game.Id].Remove(Context.ConnectionId);
        if (this._gameRepository.GameIdToConnections[game.Id].Count == 0)
            this._gameRepository.GameIdToGame.Remove(game.Id);

        await base.OnDisconnectedAsync(exception);
    }
}
