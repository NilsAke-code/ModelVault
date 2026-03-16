using System.Security.Claims;
using ModelVault.Api.Models;
using ModelVault.Api.Repositories;
using ModelVault.Api.Services;

namespace ModelVault.Api.Endpoints;

public static class ModelEndpoints
{
    public static void MapModelEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/models");

        // PUBLIC — anyone can browse models
        group.MapGet("/", async (
            string? search, string? category, string? tag, string? sort,
            ModelRepository repo) =>
        {
            var models = await repo.GetAllAsync(search, category, tag, sort ?? "newest");
            return Results.Ok(models);
        });

        // PUBLIC — anyone can view a single model
        group.MapGet("/{id:int}", async (int id, ModelRepository repo) =>
        {
            var model = await repo.GetByIdAsync(id);
            return model is null ? Results.NotFound() : Results.Ok(model);
        });

        // AUTH REQUIRED — upload a new model
        group.MapPost("/", async (
            HttpRequest request,
            ModelRepository repo,
            FileStorageService fileStorage) =>
        {
            var user = request.HttpContext.User;
            var authorId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue("oid") // Microsoft Entra object ID
                ?? throw new UnauthorizedAccessException("No user identity found.");
            var authorName = user.FindFirstValue("name")
                ?? user.FindFirstValue(ClaimTypes.Name)
                ?? "Unknown";

            var form = await request.ReadFormAsync();
            var modelFile = form.Files.GetFile("modelFile");
            var thumbnail = form.Files.GetFile("thumbnail");

            if (modelFile is null)
                return Results.BadRequest("Model file is required.");

            var filePath = await fileStorage.SaveModelFileAsync(modelFile);
            var thumbnailPath = thumbnail is not null
                ? await fileStorage.SaveThumbnailAsync(thumbnail)
                : "";

            var tags = form["tags"].ToString()
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            var model = new Model3D
            {
                Title = form["title"].ToString(),
                Description = form["description"].ToString(),
                Category = form["category"].ToString(),
                FilePath = filePath,
                ThumbnailPath = thumbnailPath,
                AuthorId = authorId,
                AuthorName = authorName,
                Tags = tags
            };

            var id = await repo.CreateAsync(model);
            return Results.Created($"/api/models/{id}", new { id });
        }).RequireAuthorization();

        // AUTH REQUIRED — update model (owner only)
        group.MapPut("/{id:int}", async (int id, UpdateModelRequest request, HttpContext httpContext, ModelRepository repo) =>
        {
            var model = await repo.GetByIdAsync(id);
            if (model is null)
                return Results.NotFound();

            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? httpContext.User.FindFirstValue("oid");
            if (model.AuthorId != userId)
                return Results.Forbid();

            await repo.UpdateAsync(id, request);
            return Results.NoContent();
        }).RequireAuthorization();

        // AUTH REQUIRED — delete model (owner only)
        group.MapDelete("/{id:int}", async (int id, HttpContext httpContext, ModelRepository repo, FileStorageService fileStorage) =>
        {
            var model = await repo.GetByIdAsync(id);
            if (model is null)
                return Results.NotFound();

            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? httpContext.User.FindFirstValue("oid");
            if (model.AuthorId != userId)
                return Results.Forbid();

            if (!string.IsNullOrEmpty(model.FilePath))
                fileStorage.DeleteFile(model.FilePath);
            if (!string.IsNullOrEmpty(model.ThumbnailPath))
                fileStorage.DeleteFile(model.ThumbnailPath);

            await repo.DeleteAsync(id);
            return Results.NoContent();
        }).RequireAuthorization();

        // AUTH REQUIRED — download a model file
        group.MapGet("/{id:int}/download", async (int id, ModelRepository repo, FileStorageService fileStorage) =>
        {
            var model = await repo.GetByIdAsync(id);
            if (model is null)
                return Results.NotFound();

            await repo.IncrementDownloadsAsync(id);

            var fullPath = fileStorage.GetFullPath(model.FilePath);
            if (!File.Exists(fullPath))
                return Results.NotFound("File not found on disk.");

            var contentType = Path.GetExtension(fullPath).ToLower() switch
            {
                ".stl" => "application/sla",
                ".3mf" => "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
                _ => "application/octet-stream"
            };

            return Results.File(fullPath, contentType, Path.GetFileName(model.FilePath));
        }).RequireAuthorization();

        // PUBLIC — anyone can like a model
        group.MapPost("/{id:int}/like", async (int id, ModelRepository repo) =>
        {
            if (!await repo.ExistsAsync(id))
                return Results.NotFound();

            await repo.IncrementLikesAsync(id);
            return Results.Ok();
        });
    }
}
