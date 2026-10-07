using FluentValidation;
using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Validation;

// API gövdesi: SirketCreateDto. Şirket tablosundaki zorunlu alanlarla uyum (Eposta NOT NULL).
public sealed class SirketCreateDtoValidator : AbstractValidator<SirketCreateDto>
{
    public SirketCreateDtoValidator()
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
