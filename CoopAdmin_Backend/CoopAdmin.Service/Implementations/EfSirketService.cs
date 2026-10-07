using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Core.Enums;
using CoopAdmin.Data;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.Service.Implementations;

/// <summary>Şirket CRUD: Sirketler tablosu, silme = Durum.Silindi (soft delete).</summary>
public sealed class EfSirketService : ISirketService
{
    private readonly CoopAdminContext _dbContext;
    private readonly IConfigurationProvider _mapperConfig;

    public EfSirketService(CoopAdminContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapperConfig = mapper.ConfigurationProvider;
    }

    public async Task<IReadOnlyList<SirketDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Sirkets
            .AsNoTracking()
            .OrderBy(x => x.Ad)
            .ProjectTo<SirketDto>(_mapperConfig)
            .ToListAsync(cancellationToken);
    }

    public async Task<SirketDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _dbContext.Sirkets
            .AsNoTracking()
            .Where(x => x.Id == id)
            .ProjectTo<SirketDto>(_mapperConfig)
            .FirstOrDefaultAsync(cancellationToken);

        if (item is null)
        {
            throw new InvalidOperationException("Şirket kaydı bulunamadı.");
        }

        return item;
    }

    public async Task<SirketDto> AddAsync(SirketCreateDto request, CancellationToken cancellationToken = default)
    {
        var vergiNo = (request.VergiNo ?? string.Empty).Trim();
        // Vergi no doluysa tekillik kontrolü (boş vergi no tekrar edebilir).
        if (!string.IsNullOrWhiteSpace(vergiNo))
        {
            var vergiNoExists = await _dbContext.Sirkets
                .AsNoTracking()
                .AnyAsync(x => x.VergiNo == vergiNo, cancellationToken);
            if (vergiNoExists)
            {
                throw new InvalidOperationException("Bu vergi numarası ile kayıtlı bir şirket zaten mevcut.");
            }
        }

        var now = DateTime.Now;
        var sirket = new Sirket
        {
            Id = Guid.NewGuid(),
            Ad = (request.Ad ?? string.Empty).Trim(),
            Telefon = (request.Telefon ?? string.Empty).Trim(),
            VergiNo = vergiNo,
            Adres = (request.Adres ?? string.Empty).Trim(),
            Eposta = (request.Eposta ?? string.Empty).Trim(),
            Durum = Durum.Aktif,
            OlusturmaTarih = now,
            GuncellemeTarih = now
        };

        _dbContext.Sirkets.Add(sirket);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Sirkets
            .AsNoTracking()
            .Where(x => x.Id == sirket.Id)
            .ProjectTo<SirketDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task<SirketDto> UpdateAsync(Guid id, SirketUpdateDto request, CancellationToken cancellationToken = default)
    {
        var sirket = await _dbContext.Sirkets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (sirket is null || sirket.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Güncellenecek şirket kaydı bulunamadı.");
        }

        var vergiNo = (request.VergiNo ?? string.Empty).Trim();
        // Güncellemede aynı vergi no başka kayıtta kullanılıyor mu?
        if (!string.IsNullOrWhiteSpace(vergiNo))
        {
            var vergiNoExists = await _dbContext.Sirkets
                .AsNoTracking()
                .AnyAsync(x => x.VergiNo == vergiNo && x.Id != id, cancellationToken);
            if (vergiNoExists)
            {
                throw new InvalidOperationException("Bu vergi numarası ile kayıtlı başka bir şirket mevcut.");
            }
        }

        sirket.Ad = (request.Ad ?? string.Empty).Trim();
        sirket.Telefon = (request.Telefon ?? string.Empty).Trim();
        sirket.VergiNo = vergiNo;
        sirket.Adres = (request.Adres ?? string.Empty).Trim();
        sirket.Eposta = (request.Eposta ?? string.Empty).Trim();
        sirket.GuncellemeTarih = DateTime.Now;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Sirkets
            .AsNoTracking()
            .Where(x => x.Id == id)
            .ProjectTo<SirketDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task<SirketDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default)
    {
        if (durum != (int)Durum.Aktif && durum != (int)Durum.Pasif)
        {
            throw new InvalidOperationException("Durum sadece Aktif(1) veya Pasif(2) olabilir.");
        }

        var sirket = await _dbContext.Sirkets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (sirket is null || sirket.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Durumu güncellenecek şirket kaydı bulunamadı.");
        }

        sirket.Durum = (Durum)durum;
        sirket.GuncellemeTarih = DateTime.Now;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Sirkets
            .AsNoTracking()
            .Where(x => x.Id == id)
            .ProjectTo<SirketDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sirket = await _dbContext.Sirkets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (sirket is null || sirket.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Silinecek şirket kaydı bulunamadı.");
        }

        sirket.Durum = Durum.Silindi;
        sirket.GuncellemeTarih = DateTime.Now;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
