using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Abstractions;

public interface IRolService
{
    Task<IReadOnlyList<RolOptionDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
