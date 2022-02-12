using System.Text.Json;

namespace Crossword.Models;

public class Game
{
    public string Id;
    public Crossword? ActiveCrossword;

    public Game(string gameId, string crosswordDate)
    {
        this.Id = gameId;
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
