using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Abstractions;

public interface ISirketService
{
    Task<IReadOnlyList<SirketDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SirketDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SirketDto> AddAsync(SirketCreateDto request, CancellationToken cancellationToken = default);
    Task<SirketDto> UpdateAsync(Guid id, SirketUpdateDto request, CancellationToken cancellationToken = default);
    Task<SirketDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
