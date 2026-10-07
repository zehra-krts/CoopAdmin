using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Core.Enums;
using CoopAdmin.Data;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.Service.Implementations;

public sealed class EfKullaniciService : IKullaniciService
{
    private readonly CoopAdminContext _dbContext;
    private readonly IConfigurationProvider _mapperConfig;

    public EfKullaniciService(CoopAdminContext dbContext, IMapper mapper)
    {
        _dbContext = dbContext;
        _mapperConfig = mapper.ConfigurationProvider;
    }

    public async Task<IReadOnlyList<KullaniciDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Kullanicis
            .AsNoTracking()
            .Include(x => x.Sirket)
            .Include(x => x.Rol)
            .Where(x =>
                !x.Rol.Ad.ToLower().Contains("müstahsil") &&
                !x.Rol.Ad.ToLower().Contains("mustahsil"))
            .OrderBy(x => x.Ad)
            .ThenBy(x => x.Soyad)
            .ProjectTo<KullaniciDto>(_mapperConfig)
            .ToListAsync(cancellationToken);
    }

    public async Task<KullaniciDto> CreateAsync(KullaniciCreateDto request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var sirketExists = await _dbContext.Sirkets
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SirketId, cancellationToken);
        if (!sirketExists)
        {
            throw new InvalidOperationException("Gecerli bir sirket secimi zorunludur.");
        }

        var rol = await _dbContext.Rols
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.RolId, cancellationToken);
        if (rol is null)
        {
            throw new InvalidOperationException("Gecerli bir rol secimi zorunludur.");
        }

        var tcExists = await _dbContext.Kullanicis
            .AsNoTracking()
            .AnyAsync(x => x.TcKimlikNo == request.TcKimlikNo, cancellationToken);
        if (tcExists)
        {
            throw new InvalidOperationException("Bu TC Kimlik No ile kayitli bir kullanici zaten mevcut.");
        }

        var kullanici = new Kullanici
        {
            Id = Guid.NewGuid(),
            Ad = request.Ad.Trim(),
            Soyad = request.Soyad.Trim(),
            TcKimlikNo = request.TcKimlikNo.Trim(),
            Sifre = request.Sifre,
            TelefonNo = request.TelefonNo.Trim(),
            Eposta = string.IsNullOrWhiteSpace(request.Eposta) ? null : request.Eposta.Trim(),
            SirketId = request.SirketId,
            RolId = request.RolId,
            Durum = Durum.Aktif,
            OlusturmaTarih = now,
            GuncellemeTarih = now
        };

        _dbContext.Kullanicis.Add(kullanici);

        if (IsMustahsilRole(rol.Ad))
        {
            var mustahsilNo = string.IsNullOrWhiteSpace(request.MustahsilNo)
                ? request.TcKimlikNo.Trim()
                : request.MustahsilNo.Trim();

            var mustahsil = new Mustahsil
            {
                Id = Guid.NewGuid(),
                Ad = $"{kullanici.Ad} {kullanici.Soyad}".Trim(),
                No = mustahsilNo,
                TelNo = kullanici.TelefonNo,
                Adres = string.IsNullOrWhiteSpace(request.Adres) ? null : request.Adres.Trim(),
                CariKod = string.IsNullOrWhiteSpace(request.CariKod) ? null : request.CariKod.Trim(),
                QrKod = null,
                KullaniciId = kullanici.Id,
                SirketId = kullanici.SirketId,
                Durum = Durum.Aktif,
                OlusturmaTarih = now,
                GuncellemeTarih = now
            };

            _dbContext.Mustahsils.Add(mustahsil);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Kullanicis
            .AsNoTracking()
            .Include(x => x.Sirket)
            .Include(x => x.Rol)
            .Where(x => x.Id == kullanici.Id)
            .ProjectTo<KullaniciDto>(_mapperConfig)
            .FirstAsync(cancellationToken);

        return created;
    }

    public async Task<KullaniciDto> UpdateAsync(Guid id, KullaniciUpdateDto request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;

        var kullanici = await _dbContext.Kullanicis.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (kullanici is null || kullanici.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Guncellenecek kullanici kaydi bulunamadi.");
        }

        var sirketExists = await _dbContext.Sirkets
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SirketId, cancellationToken);
        if (!sirketExists)
        {
            throw new InvalidOperationException("Gecerli bir sirket secimi zorunludur.");
        }

        var rol = await _dbContext.Rols
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.RolId, cancellationToken);
        if (rol is null)
        {
            throw new InvalidOperationException("Gecerli bir rol secimi zorunludur.");
        }

        var tcExists = await _dbContext.Kullanicis
            .AsNoTracking()
            .AnyAsync(x => x.TcKimlikNo == request.TcKimlikNo && x.Id != id, cancellationToken);
        if (tcExists)
        {
            throw new InvalidOperationException("Bu TC Kimlik No ile kayitli baska bir kullanici zaten mevcut.");
        }

        kullanici.Ad = request.Ad.Trim();
        kullanici.Soyad = request.Soyad.Trim();
        kullanici.TcKimlikNo = request.TcKimlikNo.Trim();
        kullanici.TelefonNo = request.TelefonNo.Trim();
        kullanici.Eposta = string.IsNullOrWhiteSpace(request.Eposta) ? null : request.Eposta.Trim();
        kullanici.SirketId = request.SirketId;
        kullanici.RolId = request.RolId;
        kullanici.GuncellemeTarih = now;

        if (!string.IsNullOrWhiteSpace(request.Sifre))
        {
            kullanici.Sifre = request.Sifre;
        }

        var mustahsil = await _dbContext.Mustahsils.FirstOrDefaultAsync(x => x.KullaniciId == id, cancellationToken);
        if (IsMustahsilRole(rol.Ad))
        {
            var mustahsilNo = string.IsNullOrWhiteSpace(request.MustahsilNo)
                ? request.TcKimlikNo.Trim()
                : request.MustahsilNo.Trim();

            if (mustahsil is null)
            {
                mustahsil = new Mustahsil
                {
                    Id = Guid.NewGuid(),
                    KullaniciId = id,
                    OlusturmaTarih = now,
                    Durum = Durum.Aktif
                };
                _dbContext.Mustahsils.Add(mustahsil);
            }

            mustahsil.Ad = $"{kullanici.Ad} {kullanici.Soyad}".Trim();
            mustahsil.No = mustahsilNo;
            mustahsil.TelNo = kullanici.TelefonNo;
            mustahsil.Adres = string.IsNullOrWhiteSpace(request.Adres) ? null : request.Adres.Trim();
            mustahsil.CariKod = string.IsNullOrWhiteSpace(request.CariKod) ? null : request.CariKod.Trim();
            mustahsil.SirketId = request.SirketId;
            mustahsil.Durum = Durum.Aktif;
            mustahsil.GuncellemeTarih = now;
        }
        else if (mustahsil is not null && mustahsil.Durum != Durum.Silindi)
        {
            mustahsil.Durum = Durum.Silindi;
            mustahsil.GuncellemeTarih = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var updated = await _dbContext.Kullanicis
            .AsNoTracking()
            .Include(x => x.Sirket)
            .Include(x => x.Rol)
            .Where(x => x.Id == id)
            .ProjectTo<KullaniciDto>(_mapperConfig)
            .FirstAsync(cancellationToken);

        return updated;
    }

    public async Task<KullaniciDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default)
    {
        if (durum != (int)Durum.Aktif && durum != (int)Durum.Pasif)
        {
            throw new InvalidOperationException("Durum sadece Aktif(1) veya Pasif(2) olabilir.");
        }

        var kullanici = await _dbContext.Kullanicis
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (kullanici is null || kullanici.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Durumu guncellenecek kullanici kaydi bulunamadi.");
        }

        var newDurum = (Durum)durum;
        var now = DateTime.Now;

        kullanici.Durum = newDurum;
        kullanici.GuncellemeTarih = now;

        var mustahsil = await _dbContext.Mustahsils
            .FirstOrDefaultAsync(x => x.KullaniciId == id, cancellationToken);
        if (mustahsil is not null && mustahsil.Durum != Durum.Silindi)
        {
            mustahsil.Durum = newDurum;
            mustahsil.GuncellemeTarih = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var updated = await _dbContext.Kullanicis
            .AsNoTracking()
            .Include(x => x.Sirket)
            .Include(x => x.Rol)
            .Where(x => x.Id == id)
            .ProjectTo<KullaniciDto>(_mapperConfig)
            .FirstAsync(cancellationToken);

        return updated;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var kullanici = await _dbContext.Kullanicis.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (kullanici is null || kullanici.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Silinecek kullanici kaydi bulunamadi.");
        }

        kullanici.Durum = Durum.Silindi;
        kullanici.GuncellemeTarih = DateTime.Now;

        var mustahsil = await _dbContext.Mustahsils.FirstOrDefaultAsync(x => x.KullaniciId == id, cancellationToken);
        if (mustahsil is not null && mustahsil.Durum != Durum.Silindi)
        {
            mustahsil.Durum = Durum.Silindi;
            mustahsil.GuncellemeTarih = DateTime.Now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static bool IsMustahsilRole(string roleName)
    {
        var role = (roleName ?? string.Empty).Trim().ToLowerInvariant();
        return role.Contains("müstahsil") || role.Contains("mustahsil");
    }
}
