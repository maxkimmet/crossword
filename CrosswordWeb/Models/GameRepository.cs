namespace Crossword.Models;

public interface IGameRepository
{
    public Dictionary<string, Game> GameIdToGame { get; }
    public Dictionary<string, Game> ConnectionToGame { get; }
    public Dictionary<string, List<string>> GameIdToConnections { get; }
}

public class GameRepository : IGameRepository
{
    public Dictionary<string, Game> GameIdToGame { get; } = new Dictionary<string, Game>();
    public Dictionary<string, Game> ConnectionToGame { get; } = new Dictionary<string, Game>();
    public Dictionary<string, List<string>> GameIdToConnections { get; } = new Dictionary<string, List<string>>();
}
