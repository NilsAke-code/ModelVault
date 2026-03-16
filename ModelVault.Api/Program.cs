using ModelVault.Api.Database;
using ModelVault.Api.Endpoints;
using ModelVault.Api.Repositories;
using ModelVault.Api.Seed;
using ModelVault.Api.Services;
using ModelVault.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddSingleton<DatabaseInitializer>();
builder.Services.AddSingleton<DatabaseSeeder>();
builder.Services.AddSingleton<ModelRepository>();
builder.Services.AddSingleton<TagRepository>();
builder.Services.AddSingleton<FileStorageService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.MapDefaultEndpoints();

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

app.Run();
