using Microsoft.AspNetCore.Mvc;

namespace Crossword.Controllers;

[ApiController]
[Route("[controller]")]
public class CrosswordController : ControllerBase
{
    private readonly ILogger<CrosswordController> _logger;

    public CrosswordController(ILogger<CrosswordController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public String Get()
    {
        return System.Text.Json.JsonSerializer.Serialize(new Models.Crossword {
            Date = DateTime.Today,
            Author = "Max Kimmet",
            Title = "Example Title",
            Height = 15,
            Width = 15,
            Grid = new char[2] {'A', 'b'}
        });
    }
}