using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopAdmin.Data;

[Table("Roller")]
public partial class Rol
{
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string Ad { get; set; } = null!;

    public DateTime OlusturmaTarih { get; set; }

    public DateTime GuncellemeTarih { get; set; }

    public int Durum { get; set; }

    public virtual ICollection<Kullanici> Kullanicis { get; set; } = new List<Kullanici>();
}
