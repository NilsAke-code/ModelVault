using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using ModelVault.Api.Database;
using ModelVault.Api.Endpoints;
using ModelVault.Api.Repositories;
using ModelVault.Api.Seed;
using ModelVault.Api.Services;
using ModelVault.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Authentication — validates JWT tokens from Microsoft Entra ID
var clientId = builder.Configuration["AzureAd:ClientId"];
var tenantId = builder.Configuration["AzureAd:TenantId"];
var isAuthConfigured = !string.IsNullOrEmpty(clientId) && !clientId.Contains("YOUR_");

if (isAuthConfigured)
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = "https://login.microsoftonline.com/common/v2.0";
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidAudiences = new[] { clientId, $"api://{clientId}" },
                ValidateIssuer = false, // Accept any tenant + personal Microsoft accounts
                ValidateAudience = true,
                ValidateLifetime = true,
            };
        });
}
else
{
    // Placeholder auth so [Authorize] doesn't crash — no real validation
    builder.Services.AddAuthentication();
}
builder.Services.AddAuthorization();

builder.Services.AddSingleton<DatabaseInitializer>();
builder.Services.AddSingleton<DatabaseSeeder>();
builder.Services.AddSingleton<ModelRepository>();
builder.Services.AddSingleton<TagRepository>();
builder.Services.AddSingleton<FileStorageService>();
builder.Services.AddSingleton<UserRepository>();

// CORS only needed locally — in production frontend and backend share the same origin
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });
}

var app = builder.Build();

if (builder.Environment.IsDevelopment())
    app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapDefaultEndpoints();

// Serve React SPA from wwwroot (populated at build time by the CI workflow)
app.UseDefaultFiles();
app.UseStaticFiles();

// Initialize database and seed
var dbInit = app.Services.GetRequiredService<DatabaseInitializer>();
await dbInit.InitializeAsync();

var seeder = app.Services.GetRequiredService<DatabaseSeeder>();
await seeder.SeedAsync();

// Serve uploaded files
var fileStorage = app.Services.GetRequiredService<FileStorageService>();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        fileStorage.GetFullPath("")),
    RequestPath = "/uploads"
});

app.MapModelEndpoints();
app.MapTagEndpoints();
app.MapCategoryEndpoints();
app.MapUserEndpoints();

// Fallback to index.html for SPA client-side routing
app.MapFallbackToFile("index.html");

app.Run();
