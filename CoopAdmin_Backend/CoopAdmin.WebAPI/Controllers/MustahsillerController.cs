using Microsoft.AspNetCore.Mvc;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.WebAPI.Controllers;

[ApiController]
[Route("api/mustahsiller")]
public sealed class MustahsillerController : ControllerBase
{
    private readonly IMustahsilService _mustahsilService;

    public MustahsillerController(IMustahsilService mustahsilService)
    {
        _mustahsilService = mustahsilService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MustahsilDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MustahsilDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _mustahsilService.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MustahsilDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MustahsilDto>> Create([FromBody] MustahsilCreateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _mustahsilService.CreateAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(MustahsilDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MustahsilDto>> Update(Guid id, [FromBody] MustahsilUpdateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _mustahsilService.UpdateAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/durum")]
    [ProducesResponseType(typeof(MustahsilDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MustahsilDto>> UpdateDurum(
        Guid id,
        [FromBody] MustahsilDurumUpdateDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _mustahsilService.UpdateDurumAsync(id, request.Durum, cancellationToken);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _mustahsilService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
