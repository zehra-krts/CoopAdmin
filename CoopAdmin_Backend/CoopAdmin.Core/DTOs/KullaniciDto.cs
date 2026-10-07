namespace CoopAdmin.Core.DTOs;

public sealed class KullaniciDto
{
    public Guid Id { get; set; }
    public string Ad { get; set; } = string.Empty;
    public string Soyad { get; set; } = string.Empty;
    public string TcKimlikNo { get; set; } = string.Empty;
    public string TelefonNo { get; set; } = string.Empty;
    public string? Eposta { get; set; }
    public Guid SirketId { get; set; }
    public Guid RolId { get; set; }
    public string SirketAdi { get; set; } = string.Empty;
    public string RolAdi { get; set; } = string.Empty;
    public int Durum { get; set; }
}
