using Microsoft.AspNetCore.Mvc;

namespace Crossword.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CrosswordController : ControllerBase
{
    private readonly ILogger<CrosswordController> _logger;

    public CrosswordController(ILogger<CrosswordController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public string Get()
    {
        // Get list of six latest crosswordPaths
        int maxCrosswords = 6;
        List<string> latestCrosswordPaths = new List<string>();
        string[] directories = System.IO.Directory.GetDirectories("Crosswords");
        Array.Sort(directories);
        Array.Reverse(directories);
        foreach (string directory in directories)
        {
            if (latestCrosswordPaths.Count >= maxCrosswords) break;
            string[] crosswordPaths = System.IO.Directory.GetFiles(directory);
            Array.Sort(crosswordPaths);
            Array.Reverse(crosswordPaths);
            foreach (string crosswordPath in crosswordPaths)
            {
                if (latestCrosswordPaths.Count >= maxCrosswords) break;
                latestCrosswordPaths.Add(crosswordPath);
            }
        }

        // Generate output as JSON string
        string response = "[";
        foreach (string crosswordPath in latestCrosswordPaths)
        {
            string crosswordJson = System.IO.File.ReadAllText(
                crosswordPath,
                System.Text.Encoding.UTF8
            );
            response += $"{crosswordJson},";
        }
        response = $"{response.Remove(response.Length - 1)}]";

        return response;
    }

    [HttpGet("{dateString}")]
    public string Get(string dateString)
    {
        // Return contents of dateString.json
        DateTime date = DateTime.Parse(dateString);
        if (DateTime.TryParse(dateString, out date))
        {
            string filePath = System.IO.Path.Join(
                "Crosswords",
                $"{date.Year}",
                $"{date.ToString("yyyy-MM-dd")}.json"
            );

            if (System.IO.File.Exists(filePath))
                return System.IO.File.ReadAllText(filePath, System.Text.Encoding.UTF8);
        }

        return "{}";
    }
}