using FluentValidation;
using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Validation;

public sealed class KullaniciUpdateDtoValidator : AbstractValidator<KullaniciUpdateDto>
{
    public KullaniciUpdateDtoValidator()
    {
        RuleFor(x => x.Ad)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Soyad)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.TcKimlikNo)
            .NotEmpty()
            .Length(11)
            .Matches(@"^\d{11}$")
            .WithMessage("TC Kimlik No 11 haneli ve sadece rakamlardan olusmalidir.");

        RuleFor(x => x.Sifre)
            .Matches(@"^\d{6}$")
            .WithMessage("Sifre 6 haneli ve sadece rakamlardan olusmalidir.")
            .When(x => !string.IsNullOrWhiteSpace(x.Sifre));

        RuleFor(x => x.TelefonNo)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.Eposta)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Eposta));

        RuleFor(x => x.SirketId)
            .NotEqual(Guid.Empty)
            .WithMessage("SirketId zorunludur.");

        RuleFor(x => x.RolId)
            .NotEqual(Guid.Empty)
            .WithMessage("RolId zorunludur.");

        RuleFor(x => x.MustahsilNo)
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.MustahsilNo));

        RuleFor(x => x.CariKod)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.CariKod));

        RuleFor(x => x.Adres)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Adres));
    }
}
