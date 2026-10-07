using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopAdmin.Data;

[Table("Mustahsiller", Schema = "dbo")]
public class Mustahsil : BaseModel
{
    [Column("Ad")]
    [MaxLength(200)]
    public string? Ad { get; set; }

    [Column("No")]
    [Required]
    [MaxLength(50)]
    public string No { get; set; } = string.Empty;

    [Column("TelNo")]
    [MaxLength(20)]
    public string? TelNo { get; set; }

    [Column("Adres")]
    [MaxLength(1000)]
    public string? Adres { get; set; }

    [Column("CariKod")]
    [MaxLength(100)]
    public string? CariKod { get; set; }

    [Column("QrKod")]
    [MaxLength(300)]
    public string? QrKod { get; set; }

    [Column("KullaniciId")]
    public Guid KullaniciId { get; set; }

    [ForeignKey(nameof(KullaniciId))]
    public Kullanici Kullanici { get; set; } = null!;

    [Column("SirketId")]
    public Guid SirketId { get; set; }

    [ForeignKey(nameof(SirketId))]
    public Sirket Sirket { get; set; } = null!;
}
