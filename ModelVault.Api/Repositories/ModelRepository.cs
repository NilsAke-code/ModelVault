using Dapper;
using Microsoft.Data.SqlClient;
using ModelVault.Api.Models;

namespace ModelVault.Api.Repositories;

public class ModelRepository(IConfiguration configuration)
{
    private SqlConnection CreateConnection() =>
        new(configuration.GetConnectionString("modelvaultdb"));

    public async Task<IEnumerable<Model3D>> GetAllAsync(string? search, string? category, string? tag, string sort = "newest")
    {
        await using var conn = CreateConnection();

        var orderBy = sort switch
        {
            "downloads" => "m.Downloads DESC",
            "likes" => "m.Likes DESC",
            _ => "m.CreatedAt DESC"
        };

        var sql = $"""
            SELECT DISTINCT m.*
            FROM Models m
            LEFT JOIN ModelTags mt ON m.Id = mt.ModelId
            LEFT JOIN Tags t ON mt.TagId = t.Id
            WHERE 1=1
            {(string.IsNullOrEmpty(search) ? "" : "AND (m.Title LIKE @Search OR m.Description LIKE @Search)")}
            {(string.IsNullOrEmpty(category) ? "" : "AND m.Category = @Category")}
            {(string.IsNullOrEmpty(tag) ? "" : "AND t.Name = @Tag")}
            ORDER BY {orderBy}
            """;

        var models = (await conn.QueryAsync<Model3D>(sql, new
        {
            Search = $"%{search}%",
            Category = category,
            Tag = tag
        })).ToList();

        if (models.Count > 0)
        {
            var modelIds = models.Select(m => m.Id).ToList();
            var tags = await conn.QueryAsync<(int ModelId, string Name)>("""
                SELECT mt.ModelId, t.Name
                FROM ModelTags mt
                JOIN Tags t ON mt.TagId = t.Id
                WHERE mt.ModelId IN @ModelIds
                """, new { ModelIds = modelIds });

            var tagLookup = tags.ToLookup(t => t.ModelId, t => t.Name);
            foreach (var model in models)
            {
                model.Tags = tagLookup[model.Id].ToList();
            }
        }

        return models;
    }

    public async Task<Model3D?> GetByIdAsync(int id)
    {
        await using var conn = CreateConnection();

        var model = await conn.QuerySingleOrDefaultAsync<Model3D>(
            "SELECT * FROM Models WHERE Id = @Id", new { Id = id });

        if (model is not null)
        {
            var tags = await conn.QueryAsync<string>("""
                SELECT t.Name FROM Tags t
                JOIN ModelTags mt ON t.Id = mt.TagId
                WHERE mt.ModelId = @Id
                """, new { Id = id });
            model.Tags = tags.ToList();
        }

        return model;
    }

    public async Task<int> CreateAsync(Model3D model)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();

        var id = await conn.QuerySingleAsync<int>("""
            INSERT INTO Models (Title, Description, FilePath, ThumbnailPath, Category, AuthorId, AuthorName, IsExploreModel, CreatedAt, UpdatedAt)
            VALUES (@Title, @Description, @FilePath, @ThumbnailPath, @Category, @AuthorId, @AuthorName, @IsExploreModel, GETUTCDATE(), GETUTCDATE());
            SELECT SCOPE_IDENTITY();
            """, model);

        if (model.Tags.Count > 0)
        {
            await SetTagsAsync(conn, id, model.Tags);
        }

        return id;
    }

    public async Task UpdateAsync(int id, UpdateModelRequest request)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();

        await conn.ExecuteAsync("""
            UPDATE Models SET Title = @Title, Description = @Description, Category = @Category, UpdatedAt = GETUTCDATE()
            WHERE Id = @Id
            """, new { Id = id, request.Title, request.Description, request.Category });

        var tags = request.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        await SetTagsAsync(conn, id, tags);
    }

    public async Task DeleteAsync(int id)
    {
        await using var conn = CreateConnection();
        await conn.ExecuteAsync("DELETE FROM Models WHERE Id = @Id", new { Id = id });
    }

    public async Task IncrementDownloadsAsync(int id, int? userId = null)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await conn.ExecuteAsync("UPDATE Models SET Downloads = Downloads + 1 WHERE Id = @Id", new { Id = id });

        if (userId.HasValue)
        {
            await conn.ExecuteAsync(
                "INSERT INTO DownloadHistory (ModelId, UserId, DownloadedAt) VALUES (@ModelId, @UserId, GETUTCDATE())",
                new { ModelId = id, UserId = userId.Value });
        }
    }

    public async Task IncrementLikesAsync(int id)
    {
        await using var conn = CreateConnection();
        await conn.ExecuteAsync("UPDATE Models SET Likes = Likes + 1 WHERE Id = @Id", new { Id = id });
    }

    public async Task<bool> ExistsAsync(int id)
    {
        await using var conn = CreateConnection();
        return await conn.ExecuteScalarAsync<bool>("SELECT CASE WHEN EXISTS(SELECT 1 FROM Models WHERE Id = @Id) THEN 1 ELSE 0 END", new { Id = id });
    }

    private static async Task SetTagsAsync(SqlConnection conn, int modelId, List<string> tagNames)
    {
        await conn.ExecuteAsync("DELETE FROM ModelTags WHERE ModelId = @ModelId", new { ModelId = modelId });

        foreach (var tagName in tagNames)
        {
            await conn.ExecuteAsync("""
                IF NOT EXISTS (SELECT 1 FROM Tags WHERE Name = @Name)
                    INSERT INTO Tags (Name) VALUES (@Name);
                """, new { Name = tagName });

            await conn.ExecuteAsync("""
                INSERT INTO ModelTags (ModelId, TagId)
                SELECT @ModelId, Id FROM Tags WHERE Name = @Name
                """, new { ModelId = modelId, Name = tagName });
        }
    }
}
