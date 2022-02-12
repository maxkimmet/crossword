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
        Crossword? crossword = JsonSerializer.Deserialize<Crossword>(crosswordData);

        // Replace all letters in crossword with spaces
        for (int i = 0; i < crossword.grid.Length; i++)
        {
            for (int j = 0; j < crossword.grid[i].Length; j++)
            {
                if (crossword.grid[i][j] != '#')
                {
                    crossword.grid[i][j] = ' ';
                }
            }
        }
        this.ActiveCrossword = crossword;
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
