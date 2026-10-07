namespace CoopAdmin.Core.DTOs;

public sealed class MustahsilUpdateDto
{
    public string IsletmeUnvani { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public string? CariKod { get; set; }
    public string? Adres { get; set; }
    public Guid SirketId { get; set; }
    public string Ad { get; set; } = string.Empty;
    public string Soyad { get; set; } = string.Empty;
    public string TcKimlikNo { get; set; } = string.Empty;
    public string Telefon { get; set; } = string.Empty;
    public string? Eposta { get; set; }
    public string? Sifre { get; set; }
}
