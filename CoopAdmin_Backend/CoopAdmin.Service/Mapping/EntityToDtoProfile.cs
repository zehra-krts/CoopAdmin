using AutoMapper;
using CoopAdmin.Core.DTOs;
using CoopAdmin.Data;

namespace CoopAdmin.Service.Mapping;

public sealed class EntityToDtoProfile : Profile
{
    public EntityToDtoProfile()
    {
        CreateMap<Sirket, SirketDto>()
            .ForMember(dest => dest.Tel, opt => opt.MapFrom(src => src.Telefon))
            .ForMember(dest => dest.MustahsilSayisi, opt => opt.MapFrom(src => src.Mustahsils.Count))
            .ForMember(dest => dest.KullaniciSayisi, opt => opt.MapFrom(src => src.Kullanicis.Count));
        CreateMap<Mustahsil, MustahsilDto>()
            .ForMember(dest => dest.KullaniciId, opt => opt.MapFrom(src => src.KullaniciId))
            .ForMember(dest => dest.Soyad, opt => opt.MapFrom(src => src.Kullanici.Soyad))
            .ForMember(dest => dest.Ad, opt => opt.MapFrom(src => src.Kullanici.Ad))
            .ForMember(dest => dest.TcKimlikNo, opt => opt.MapFrom(src => src.Kullanici.TcKimlikNo))
            .ForMember(dest => dest.Telefon, opt => opt.MapFrom(src => src.TelNo ?? src.Kullanici.TelefonNo))
            .ForMember(dest => dest.Eposta, opt => opt.MapFrom(src => src.Kullanici.Eposta))
            .ForMember(dest => dest.IsletmeUnvani, opt => opt.MapFrom(src => src.Ad ?? string.Empty))
            .ForMember(dest => dest.YetkiliAdSoyad, opt => opt.MapFrom(src => $"{src.Kullanici.Ad} {src.Kullanici.Soyad}".Trim()))
            .ForMember(dest => dest.Adres, opt => opt.MapFrom(src => src.Adres))
            .ForMember(dest => dest.SirketAdi, opt => opt.MapFrom(src => src.Sirket.Ad));
        CreateMap<Kullanici, KullaniciDto>()
            .ForMember(dest => dest.SirketAdi, opt => opt.MapFrom(src => src.Sirket.Ad))
            .ForMember(dest => dest.RolAdi, opt => opt.MapFrom(src => src.Rol.Ad));
    }
}
