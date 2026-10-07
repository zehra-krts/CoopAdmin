using Microsoft.AspNetCore.Mvc;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.WebAPI.Controllers;

[ApiController]
[Route("api/kullanicilar")]
public sealed class KullanicilarController : ControllerBase
{
    private readonly IKullaniciService _kullaniciService;

    public KullanicilarController(IKullaniciService kullaniciService)
    {
        _kullaniciService = kullaniciService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<KullaniciDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<KullaniciDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _kullaniciService.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpPost]
    [ProducesResponseType(typeof(KullaniciDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KullaniciDto>> Create([FromBody] KullaniciCreateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _kullaniciService.CreateAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(KullaniciDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KullaniciDto>> Update(Guid id, [FromBody] KullaniciUpdateDto request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _kullaniciService.UpdateAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/durum")]
    [ProducesResponseType(typeof(KullaniciDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<KullaniciDto>> UpdateDurum(
        Guid id,
        [FromBody] KullaniciDurumUpdateDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _kullaniciService.UpdateDurumAsync(id, request.Durum, cancellationToken);
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
            await _kullaniciService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
