namespace CoopAdmin.Core.DTOs;

public sealed class SirketDto
{
    public Guid Id { get; set; }
    public string Ad { get; set; } = string.Empty;
    public string VergiNo { get; set; } = string.Empty;
    public string Eposta { get; set; } = string.Empty;
    public string Tel { get; set; } = string.Empty;
    public string Telefon { get; set; } = string.Empty;
    public string Adres { get; set; } = string.Empty;
    public int Durum { get; set; }
    public int MustahsilSayisi { get; set; }
    public int KullaniciSayisi { get; set; }
}
