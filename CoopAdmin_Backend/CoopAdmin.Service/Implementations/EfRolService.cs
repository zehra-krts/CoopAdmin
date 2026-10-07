using Microsoft.EntityFrameworkCore;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Core.Enums;
using CoopAdmin.Data;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.Service.Implementations;

public sealed class EfRolService : IRolService
{
    private readonly CoopAdminContext _dbContext;

    public EfRolService(CoopAdminContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<RolOptionDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Rols
            .AsNoTracking()
            .OrderBy(x => x.Ad)
            .Select(x => new RolOptionDto
            {
                Id = x.Id,
                Ad = x.Ad
            })
            .ToListAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rol = await _dbContext.Rols.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (rol is null || rol.Durum == (int)Durum.Silindi)
        {
            throw new InvalidOperationException("Silinecek rol kaydi bulunamadi.");
        }

        rol.Durum = (int)Durum.Silindi;
        rol.GuncellemeTarih = DateTime.Now;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
