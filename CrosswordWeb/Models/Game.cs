using System.Text.Json;

namespace Crossword.Models;

public class Game
{
    public string Id;
    public Crossword? ActiveCrossword;
    public Dictionary<string, int[]> CursorPositions;

    public Game(string gameId, string crosswordDate)
    {
        this.Id = gameId;
        this.CursorPositions = new Dictionary<string, int[]>();
        string? crosswordData = Game.GetCrosswordString(crosswordDate);
        Crossword? crossword = JsonSerializer.Deserialize<Crossword>(crosswordData);

        // Initialize grid of crossword errors to falses
        crossword.errors = new bool[crossword.height][];
        for (int i = 0; i < crossword.errors.Length; i++)
            crossword.errors[i] = new bool[crossword.width];

        // Deep copy grid with answers to solution
        // ...Hacky workaround since grid contains solution and will be cleared
        crossword.solution = new char[crossword.height][];
        for (int i = 0; i < crossword.grid!.Length; i++)
        {
            crossword.solution[i] = (char[])crossword.grid[i].Clone();
        }

        // Replace all letters in grid with spaces
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
