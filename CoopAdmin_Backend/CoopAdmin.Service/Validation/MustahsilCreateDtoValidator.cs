using FluentValidation;
using CoopAdmin.Core.DTOs;

namespace CoopAdmin.Service.Validation;

public sealed class MustahsilCreateDtoValidator : AbstractValidator<MustahsilCreateDto>
{
    public MustahsilCreateDtoValidator()
    {
        RuleFor(x => x.IsletmeUnvani).MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.IsletmeUnvani));
        RuleFor(x => x.No).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CariKod).MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.CariKod));
        RuleFor(x => x.Adres).MaximumLength(1000).When(x => !string.IsNullOrWhiteSpace(x.Adres));
        RuleFor(x => x.SirketId).NotEqual(Guid.Empty);

        RuleFor(x => x.Ad).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Soyad).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TcKimlikNo).NotEmpty().Length(11).Matches(@"^\d{11}$");
        RuleFor(x => x.Telefon).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Eposta).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Eposta));
        RuleFor(x => x.Sifre)
            .NotEmpty()
            .Matches(@"^\d{6}$")
            .WithMessage("Sifre 6 haneli ve sadece rakamlardan olusmalidir.");
    }
}
