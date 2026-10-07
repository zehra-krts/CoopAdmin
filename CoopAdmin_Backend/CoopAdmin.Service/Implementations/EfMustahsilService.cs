using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Core.Enums;
using CoopAdmin.Data;
using CoopAdmin.Service.Abstractions;

namespace CoopAdmin.Service.Implementations;

// EF-based adapter. Later this can be replaced by HttpClient implementation.
public sealed class EfMustahsilService : IMustahsilService
{
    private readonly CoopAdminContext _dbContext;
    private readonly IConfigurationProvider _mapperConfig;
    private readonly ILogger<EfMustahsilService> _logger;

    public EfMustahsilService(CoopAdminContext dbContext, IMapper mapper, ILogger<EfMustahsilService> logger)
    {
        _dbContext = dbContext;
        _mapperConfig = mapper.ConfigurationProvider;
        _logger = logger;
    }

    public async Task<IReadOnlyList<MustahsilDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Mustahsils
            .AsNoTracking()
            .Include(x => x.Kullanici)
            .Include(x => x.Sirket)
            .OrderBy(x => x.Ad)
            .ProjectTo<MustahsilDto>(_mapperConfig)
            .ToListAsync(cancellationToken);
    }

    public async Task<MustahsilDto> CreateAsync(MustahsilCreateDto request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;
        var mustahsilRolId = await GetMustahsilRoleIdAsync(cancellationToken);

        var sirketExists = await _dbContext.Sirkets
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SirketId, cancellationToken);
        if (!sirketExists)
        {
            throw new InvalidOperationException("Gecerli bir sirket secimi zorunludur.");
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
            TelefonNo = request.Telefon.Trim(),
            Eposta = string.IsNullOrWhiteSpace(request.Eposta) ? null : request.Eposta.Trim(),
            SirketId = request.SirketId,
            RolId = mustahsilRolId,
            Durum = Durum.Aktif,
            OlusturmaTarih = now,
            GuncellemeTarih = now
        };

        var mustahsil = new Mustahsil
        {
            Id = Guid.NewGuid(),
            Ad = string.IsNullOrWhiteSpace(request.IsletmeUnvani) ? null : request.IsletmeUnvani.Trim(),
            No = request.No.Trim(),
            TelNo = request.Telefon.Trim(),
            Adres = string.IsNullOrWhiteSpace(request.Adres) ? null : request.Adres.Trim(),
            CariKod = string.IsNullOrWhiteSpace(request.CariKod) ? null : request.CariKod.Trim(),
            KullaniciId = kullanici.Id,
            SirketId = request.SirketId,
            Durum = Durum.Aktif,
            OlusturmaTarih = now,
            GuncellemeTarih = now,
            Kullanici = kullanici  // Navigation property - EF insert sırasını doğru belirler
        };

        _dbContext.Kullanicis.Add(kullanici);
        _dbContext.Mustahsils.Add(mustahsil);

        try
        {
            var saved = await _dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Müstahsil eklendi: Mustahsiller tablosuna Id={MustahsilId}, KullaniciId={KullaniciId}, No={No}, Ad={Ad}. SaveChanges={Saved}",
                mustahsil.Id, kullanici.Id, mustahsil.No, mustahsil.Ad ?? "(boş)", saved);

            // Doğrulama: Mustahsiller tablosunda kayıt var mı?
            var verifyCount = await _dbContext.Mustahsils
                .IgnoreQueryFilters()
                .CountAsync(x => x.Id == mustahsil.Id, cancellationToken);
            if (verifyCount == 0)
            {
                _logger.LogWarning("UYARI: Müstahsil Id={MustahsilId} Mustahsiller tablosunda bulunamadı (SaveChanges sonrası doğrulama).", mustahsil.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mustahsiller tablosuna insert hatası: MustahsilId={MustahsilId}, No={No}.", mustahsil.Id, mustahsil.No);
            throw;
        }

        return await _dbContext.Mustahsils
            .AsNoTracking()
            .Include(x => x.Kullanici)
            .Include(x => x.Sirket)
            .Where(x => x.Id == mustahsil.Id)
            .ProjectTo<MustahsilDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task<MustahsilDto> UpdateAsync(Guid id, MustahsilUpdateDto request, CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;
        var mustahsilRolId = await GetMustahsilRoleIdAsync(cancellationToken);

        var mustahsil = await _dbContext.Mustahsils
            .Include(x => x.Kullanici)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (mustahsil is null || mustahsil.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Guncellenecek mustahsil kaydi bulunamadi.");
        }

        var sirketExists = await _dbContext.Sirkets
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.SirketId, cancellationToken);
        if (!sirketExists)
        {
            throw new InvalidOperationException("Gecerli bir sirket secimi zorunludur.");
        }

        var tcExists = await _dbContext.Kullanicis
            .AsNoTracking()
            .AnyAsync(x => x.TcKimlikNo == request.TcKimlikNo && x.Id != mustahsil.KullaniciId, cancellationToken);
        if (tcExists)
        {
            throw new InvalidOperationException("Bu TC Kimlik No ile kayitli baska bir kullanici zaten mevcut.");
        }

        mustahsil.Ad = string.IsNullOrWhiteSpace(request.IsletmeUnvani) ? null : request.IsletmeUnvani.Trim();
        mustahsil.No = request.No.Trim();
        mustahsil.TelNo = request.Telefon.Trim();
        mustahsil.Adres = string.IsNullOrWhiteSpace(request.Adres) ? null : request.Adres.Trim();
        mustahsil.CariKod = string.IsNullOrWhiteSpace(request.CariKod) ? null : request.CariKod.Trim();
        mustahsil.SirketId = request.SirketId;
        mustahsil.GuncellemeTarih = now;

        mustahsil.Kullanici.Ad = request.Ad.Trim();
        mustahsil.Kullanici.Soyad = request.Soyad.Trim();
        mustahsil.Kullanici.TcKimlikNo = request.TcKimlikNo.Trim();
        mustahsil.Kullanici.TelefonNo = request.Telefon.Trim();
        mustahsil.Kullanici.Eposta = string.IsNullOrWhiteSpace(request.Eposta) ? null : request.Eposta.Trim();
        mustahsil.Kullanici.SirketId = request.SirketId;
        mustahsil.Kullanici.RolId = mustahsilRolId;
        mustahsil.Kullanici.GuncellemeTarih = now;
        if (!string.IsNullOrWhiteSpace(request.Sifre))
        {
            mustahsil.Kullanici.Sifre = request.Sifre;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Mustahsils
            .AsNoTracking()
            .Include(x => x.Kullanici)
            .Include(x => x.Sirket)
            .Where(x => x.Id == id)
            .ProjectTo<MustahsilDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task<MustahsilDto> UpdateDurumAsync(Guid id, int durum, CancellationToken cancellationToken = default)
    {
        if (durum != (int)Durum.Aktif && durum != (int)Durum.Pasif)
        {
            throw new InvalidOperationException("Durum sadece Aktif(1) veya Pasif(2) olabilir.");
        }

        var now = DateTime.Now;
        var newDurum = (Durum)durum;

        var mustahsil = await _dbContext.Mustahsils
            .Include(x => x.Kullanici)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (mustahsil is null || mustahsil.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Durumu guncellenecek mustahsil kaydi bulunamadi.");
        }

        mustahsil.Durum = newDurum;
        mustahsil.GuncellemeTarih = now;
        mustahsil.Kullanici.Durum = newDurum;
        mustahsil.Kullanici.GuncellemeTarih = now;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Mustahsils
            .AsNoTracking()
            .Include(x => x.Kullanici)
            .Include(x => x.Sirket)
            .Where(x => x.Id == id)
            .ProjectTo<MustahsilDto>(_mapperConfig)
            .FirstAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var mustahsil = await _dbContext.Mustahsils
            .Include(x => x.Kullanici)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (mustahsil is null || mustahsil.Durum == Durum.Silindi)
        {
            throw new InvalidOperationException("Silinecek mustahsil kaydi bulunamadi.");
        }

        mustahsil.Durum = Durum.Silindi;
        mustahsil.GuncellemeTarih = DateTime.Now;
        mustahsil.Kullanici.Durum = Durum.Silindi;
        mustahsil.Kullanici.GuncellemeTarih = DateTime.Now;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Guid> GetMustahsilRoleIdAsync(CancellationToken cancellationToken)
    {
        var role = await _dbContext.Rols
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Durum != (int)Durum.Silindi &&
                (x.Ad.ToLower().Contains("müstahsil") || x.Ad.ToLower().Contains("mustahsil")),
                cancellationToken);

        if (role is null)
        {
            throw new InvalidOperationException("Müstahsil rolü bulunamadı. Lütfen Rol tablosunu kontrol edin.");
        }

        return role.Id;
    }
}
