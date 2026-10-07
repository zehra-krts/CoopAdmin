namespace CoopAdmin.Core.DTOs;

// POST /api/sirketler gövdesi; VergiDairesi yok (tabloda sütun yok).
public sealed class SirketCreateDto{
    public string Ad { get; set; } = string.Empty;
    public string Eposta { get; set; } = string.Empty;
    public string Telefon { get; set; } = string.Empty;
    public string VergiNo { get; set; } = string.Empty;
    public string Adres { get; set; } = string.Empty;
}
