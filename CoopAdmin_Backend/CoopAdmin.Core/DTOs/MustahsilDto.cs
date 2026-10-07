namespace CoopAdmin.Core.DTOs;

public sealed class MustahsilDto
{
    public Guid Id { get; set; }
    public Guid KullaniciId { get; set; }
    public string? Ad { get; set; }
    public string? Soyad { get; set; }
    public string? TcKimlikNo { get; set; }
    public string? Telefon { get; set; }
    public string? Eposta { get; set; }
    public string IsletmeUnvani { get; set; } = string.Empty;
    public string YetkiliAdSoyad { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public string? CariKod { get; set; }
    public string? Adres { get; set; }
    public Guid SirketId { get; set; }
    public string SirketAdi { get; set; } = string.Empty;
    public int Durum { get; set; }
}
