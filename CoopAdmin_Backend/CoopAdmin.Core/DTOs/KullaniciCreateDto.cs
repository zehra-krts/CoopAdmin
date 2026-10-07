namespace CoopAdmin.Core.DTOs;

public sealed class KullaniciCreateDto
{
    public string Ad { get; set; } = string.Empty;
    public string Soyad { get; set; } = string.Empty;
    public string TcKimlikNo { get; set; } = string.Empty;
    public string Sifre { get; set; } = string.Empty;
    public string TelefonNo { get; set; } = string.Empty;
    public string? Eposta { get; set; }
    public Guid SirketId { get; set; }
    public Guid RolId { get; set; }
    public string? MustahsilNo { get; set; }
    public string? CariKod { get; set; }
    public string? Adres { get; set; }
}
