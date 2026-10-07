using FluentValidation;
using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Validation;

// Şirket güncelleme isteği doğrulaması.
public sealed class SirketUpdateDtoValidator : AbstractValidator<SirketUpdateDto>
{
    public SirketUpdateDtoValidator()
    {
        RuleFor(x => x.Ad)
            .NotEmpty()
            .MaximumLength(200)
            .WithMessage("Şirket adı zorunludur.");

        RuleFor(x => x.Telefon)
            .NotEmpty()
            .MaximumLength(20)
            .WithMessage("Telefon zorunludur.");

        RuleFor(x => x.VergiNo)
            .MaximumLength(50);

        RuleFor(x => x.Adres)
            .MaximumLength(1000);

        RuleFor(x => x.Eposta)
            .NotEmpty()
            .WithMessage("E-posta zorunludur.")
            .MaximumLength(200)
            .EmailAddress()
            .WithMessage("Geçerli bir e-posta adresi giriniz.");
    }
}
