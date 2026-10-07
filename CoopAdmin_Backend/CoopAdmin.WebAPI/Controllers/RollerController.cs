using Microsoft.AspNetCore.Mvc;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.WebAPI.Controllers;

[ApiController]
[Route("api/roller")]
public sealed class RollerController : ControllerBase
{
    private readonly IRolService _rolService;

    public RollerController(IRolService rolService)
    {
        _rolService = rolService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RolOptionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<RolOptionDto>>> GetAll(CancellationToken cancellationToken)
    {
        var roles = await _rolService.GetAllAsync(cancellationToken);
        return Ok(roles);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _rolService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
