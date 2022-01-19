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
        return System.IO.File.ReadAllText(
            System.IO.Path.Join("Crosswords", "2022-01-11.json"),
            System.Text.Encoding.UTF8
        );
    }
}