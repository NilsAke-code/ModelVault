using Dapper;
using Microsoft.Data.SqlClient;

namespace ModelVault.Api.Seed;

public class DatabaseSeeder(IConfiguration configuration)
{
    public async Task SeedAsync()
    {
        var connectionString = configuration.GetConnectionString("modelvaultdb");
        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        var count = await conn.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Models");
        if (count > 0) return;

        var models = SeedData.GetModels();

        foreach (var model in models)
        {
            var id = await conn.QuerySingleAsync<int>("""
                INSERT INTO Models (Title, Description, FilePath, ThumbnailPath, Category, AuthorId, AuthorName, Downloads, Likes, IsExploreModel, CreatedAt, UpdatedAt)
                VALUES (@Title, @Description, @FilePath, @ThumbnailPath, @Category, @AuthorId, @AuthorName, @Downloads, @Likes, 1, @CreatedAt, @CreatedAt);
                SELECT SCOPE_IDENTITY();
                """, model);

            foreach (var tag in model.Tags)
            {
                await conn.ExecuteAsync("""
                    IF NOT EXISTS (SELECT 1 FROM Tags WHERE Name = @Name)
                        INSERT INTO Tags (Name) VALUES (@Name);
                    """, new { Name = tag });

                await conn.ExecuteAsync("""
                    INSERT INTO ModelTags (ModelId, TagId)
                    SELECT @ModelId, Id FROM Tags WHERE Name = @Name
                    """, new { ModelId = id, Name = tag });
            }
        }
    }
}
