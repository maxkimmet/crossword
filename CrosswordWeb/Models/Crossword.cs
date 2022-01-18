namespace Crossword.Models;

public class Crossword
{
    public DateTime Date { get; set; }
    public string? Title { get; set; }
    public string? Author { get; set; }
    public int Height { get; set; }
    public int Width { get; set; }
    public char[]? Grid { get; set; }
}
