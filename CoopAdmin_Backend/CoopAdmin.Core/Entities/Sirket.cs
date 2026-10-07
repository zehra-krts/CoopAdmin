using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopAdmin.Data;

/// <summary>dbo.Sirketler — şirket/kooperatif kaydı.</summary>
[Table("Sirketler")]
public class Sirket : BaseModel
{
    [Required]
    [MaxLength(200)]
    public string Ad { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Eposta { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Telefon { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string VergiNo { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Adres { get; set; } = string.Empty;

    public ICollection<Kullanici> Kullanicis { get; set; } = new List<Kullanici>();
    public ICollection<Mustahsil> Mustahsils { get; set; } = new List<Mustahsil>();
}
