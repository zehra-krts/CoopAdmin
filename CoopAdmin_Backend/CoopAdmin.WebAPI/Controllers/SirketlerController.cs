using Microsoft.AspNetCore.Mvc;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.WebAPI.Controllers;

[ApiController]
[Route("api/sirketler")]
public sealed class SirketlerController : ControllerBase
{
    private readonly ISirketService _sirketService;

    public SirketlerController(ISirketService sirketService)
    {
        _sirketService = sirketService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SirketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SirketDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _sirketService.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SirketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SirketDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _sirketService.GetByIdAsync(id, cancellationToken);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(SirketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SirketDto>> Create([FromBody] SirketCreateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _sirketService.AddAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SirketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SirketDto>> Update(Guid id, [FromBody] SirketUpdateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _sirketService.UpdateAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/durum")]
    [ProducesResponseType(typeof(SirketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SirketDto>> UpdateDurum(
        Guid id,
        [FromBody] SirketDurumUpdateDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _sirketService.UpdateDurumAsync(id, request.Durum, cancellationToken);
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
            await _sirketService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
