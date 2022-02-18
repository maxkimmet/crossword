using Microsoft.AspNetCore.SignalR;
using Crossword.Models;

namespace Crossword.Hubs;

public interface ICrosswordClient
{
    Task RegisterConnection(string connectionId);
    Task UpdateUrl(string gameId);
    Task RenderCursors(Dictionary<string, int[]> cursorPositions);
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
        this._gameRepository.GameIdToGame[gameId] = game;
        this._gameRepository.ConnectionToGame[Context.ConnectionId] = game;
        this._gameRepository.GameIdToConnections[gameId] = new List<string> { Context.ConnectionId };

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Send client its connection ID
        await Clients.Client(Context.ConnectionId).RegisterConnection(Context.ConnectionId);

        // Update client's URL
        await Clients.Client(Context.ConnectionId).UpdateUrl(gameId);
    }

    public async Task JoinGame(string gameId)
    {
        Game game = this._gameRepository.GameIdToGame[gameId];

        // Update dictionaries
        this._gameRepository.ConnectionToGame[Context.ConnectionId] = game;
        this._gameRepository.GameIdToConnections[game.Id].Add(Context.ConnectionId);

        // Add player to hub group for game
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Send client its connection ID
        await Clients.Client(Context.ConnectionId).RegisterConnection(Context.ConnectionId);
    }

    public async Task UpdatePlayerCursor(int row, int col) {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];
        game.CursorPositions[Context.ConnectionId] = new int[] {row, col};
        await Clients.Group(game.Id).RenderCursors(game.CursorPositions);
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

    public async Task UpdateGrid()
    {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];
        Crossword.Models.Crossword crossword = game.ActiveCrossword!;
        await Clients.Group(game.Id).RenderGrid(crossword.grid!, crossword.errors!);
    }

    public async Task UpdateErrors()
    {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];
        Crossword.Models.Crossword crossword = game.ActiveCrossword!;
        for (int i = 0; i < crossword.grid!.Length; i++)
        {
            for (int j = 0; j < crossword.grid[i].Length; j++)
            {
                crossword.errors![i][j] = (crossword.grid[i][j] != crossword.solution![i][j]);
            }
        }
        await Clients.Group(game.Id).RenderGrid(crossword.grid, crossword.errors!);
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Game game = this._gameRepository.ConnectionToGame[Context.ConnectionId];

        // Remove player's cursor
        game.CursorPositions.Remove(Context.ConnectionId);
        await Clients.Group(game.Id).RenderCursors(game.CursorPositions);

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
