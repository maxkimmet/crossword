namespace Crossword.Models;

public class Entry
{
    public string? name { get; set; }
    public string? word { get; set; }
    public string? clue { get; set; }
    public int[][]? cells { get; set; }
}

public class Crossword
{
    public DateTime date { get; set; }
    public string? title { get; set; }
    public string? author { get; set; }
    public int height { get; set; }
    public int width { get; set; }
    public char[][]? grid { get; set; }
    public char[][]? solution { get; set; }
    public bool[][]? errors {get; set;}
    public List<Entry>? entries { get; set; }
}
