using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopAdmin.Data;

[Table("Kullanicilar")]
public class Kullanici : BaseModel
{
    [Required]
    [MaxLength(100)]
    public string Ad { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Soyad { get; set; } = string.Empty;

    [Required]
    [MaxLength(11)]
    public string TcKimlikNo { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Sifre { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string TelefonNo { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Eposta { get; set; }

    public Guid SirketId { get; set; }
    public Guid RolId { get; set; }

    [ForeignKey(nameof(SirketId))]
    public Sirket Sirket { get; set; } = null!;

    [ForeignKey(nameof(RolId))]
    public Rol Rol { get; set; } = null!;

    public ICollection<Mustahsil> Mustahsiller { get; set; } = new List<Mustahsil>();
}
