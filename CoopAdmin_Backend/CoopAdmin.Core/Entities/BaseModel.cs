using CoopAdmin.Core.Enums;

namespace CoopAdmin.Data;

public abstract class BaseModel
{
    public Guid Id { get; set; }
    public DateTime OlusturmaTarih { get; set; }
    public DateTime GuncellemeTarih { get; set; }
    public Durum Durum { get; set; } = Durum.Aktif;
}
