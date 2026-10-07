using AutoMapper;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using CoopAdmin.Data;
using CoopAdmin.Service;
using CoopAdmin.Service.Abstractions;
using CoopAdmin.Service.Implementations;

var builder = WebApplication.CreateBuilder(args);

// --- Servis kayıtları (API, doğrulama, EF Core, CORS) ---
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(typeof(ServiceAssemblyMarker).Assembly);
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ServiceAssemblyMarker).Assembly));
builder.Services.AddDbContext<CoopAdminContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ISirketService, EfSirketService>();
builder.Services.AddScoped<IMustahsilService, EfMustahsilService>();
builder.Services.AddScoped<IKullaniciService, EfKullaniciService>();
builder.Services.AddScoped<IRolService, EfRolService>();
// Yerel Vite paneli (5173). Canlıda WithOrigins listesine üretim URL'lerini ekleyin.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Geliştirme: Mustahsil → dbo.Mustahsiller; başlangıçta erişim kontrolü.
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CoopAdminContext>();
        var entityType = db.Model.FindEntityType(typeof(Mustahsil));
        var tableName = entityType?.GetTableName() ?? "Mustahsiller";
        var count = await db.Mustahsils.LongCountAsync();
        app.Logger.LogInformation(
            "Tablo doğrulaması: Mustahsil entity'si '{TableName}' tablosuna eşleniyor ({Count} kayıt erişilebilir).",
            tableName, count);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex,
            "UYARI: Mustahsiller tablosu erişilemedi! Veritabanındaki tablo adının 'Mustahsiller' olduğundan emin olun.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
// Development: panel http://localhost:5177 kullanır; UseHttpsRedirection burada kapalı (aksi halde istek kırılabilir).
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();
