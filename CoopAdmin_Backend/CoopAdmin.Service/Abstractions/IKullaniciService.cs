using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Abstractions;

public interface IKullaniciService
{
    Task<IReadOnlyList<KullaniciDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<KullaniciDto> CreateAsync(KullaniciCreateDto request, CancellationToken cancellationToken = default);
    Task<KullaniciDto> UpdateAsync(Guid id, KullaniciUpdateDto request, CancellationToken cancellationToken = default);
    Task<KullaniciDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
