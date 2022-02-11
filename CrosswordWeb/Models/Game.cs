using System.Text.Json;

namespace Crossword.Models;

public class Game
{
    public string Id;
    public List<string> ConnectionIds;
    public Crossword? ActiveCrossword;

    public Game(string gameId, string connectionId, string crosswordDate)
    {
        this.Id = gameId;
        this.ConnectionIds = new List<string> { connectionId };
        string? crosswordData = Game.GetCrosswordString(crosswordDate);
        this.ActiveCrossword = JsonSerializer.Deserialize<Crossword>(crosswordData!);
    }

    public static string? GetCrosswordString(string crosswordDate)
    {
        DateTime date = new DateTime();
        if (DateTime.TryParse(crosswordDate, out date))
        {
            string filePath = System.IO.Path.Join(
                "Crosswords",
                $"{date.Year}",
                $"{date.ToString("yyyy-MM-dd")}.json"
            );

            if (System.IO.File.Exists(filePath))
                return System.IO.File.ReadAllText(filePath, System.Text.Encoding.UTF8);
        }
        return null;
    }
}
