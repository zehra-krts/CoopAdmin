using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Abstractions;

public interface IMustahsilService
{
    Task<IReadOnlyList<MustahsilDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<MustahsilDto> CreateAsync(MustahsilCreateDto request, CancellationToken cancellationToken = default);
    Task<MustahsilDto> UpdateAsync(Guid id, MustahsilUpdateDto request, CancellationToken cancellationToken = default);
    Task<MustahsilDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
