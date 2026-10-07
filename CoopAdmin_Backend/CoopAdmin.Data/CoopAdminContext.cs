using Microsoft.EntityFrameworkCore;
using CoopAdmin.Core.Enums;

namespace CoopAdmin.Data;

public class CoopAdminContext : DbContext
{
    public CoopAdminContext(DbContextOptions<CoopAdminContext> options)
        : base(options)
    {
    }

    public DbSet<Sirket> Sirkets => Set<Sirket>();
    public DbSet<Kullanici> Kullanicis => Set<Kullanici>();
    public DbSet<Mustahsil> Mustahsils => Set<Mustahsil>();
    public DbSet<Rol> Rols => Set<Rol>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Sirket>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Kullanici>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Mustahsil>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Rol>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Sirket>()
            .HasQueryFilter(x => x.Durum != Durum.Silindi);

        modelBuilder.Entity<Kullanici>()
            .HasQueryFilter(x => x.Durum != Durum.Silindi);

        modelBuilder.Entity<Mustahsil>()
            .HasQueryFilter(x => x.Durum != Durum.Silindi);

        modelBuilder.Entity<Rol>()
            .HasQueryFilter(x => x.Durum != (int)Durum.Silindi);

        modelBuilder.Entity<Kullanici>()
            .HasOne(x => x.Sirket)
            .WithMany(x => x.Kullanicis)
            .HasForeignKey(x => x.SirketId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Kullanici>()
            .HasOne(x => x.Rol)
            .WithMany(x => x.Kullanicis)
            .HasForeignKey(x => x.RolId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Mustahsil>()
            .HasOne(x => x.Sirket)
            .WithMany(x => x.Mustahsils)
            .HasForeignKey(x => x.SirketId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Mustahsil>()
            .HasOne(x => x.Kullanici)
            .WithMany(x => x.Mustahsiller)
            .HasForeignKey(x => x.KullaniciId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
