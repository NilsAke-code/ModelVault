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

        // Seed models
        var count = await conn.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Models");
        if (count == 0)
        {
            await SeedModelsAsync(conn);
        }

        // Seed mock users (independent of models)
        var userCount = await conn.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Users WHERE Role < 2");
        if (userCount == 0)
        {
            await SeedUsersAsync(conn);
        }
    }

    private static async Task SeedModelsAsync(SqlConnection conn)
    {
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

    private static async Task SeedUsersAsync(SqlConnection conn)
    {
        var mockUsers = new[]
            {
                new { Email = "emma.karlsson@outlook.com", DisplayName = "Emma Karlsson", Role = 1 },
                new { Email = "james.wilson@hotmail.com", DisplayName = "James Wilson", Role = 1 },
                new { Email = "sofia.andersson@gmail.com", DisplayName = "Sofia Andersson", Role = 1 },
                new { Email = "david.chen@outlook.com", DisplayName = "David Chen", Role = 1 },
                new { Email = "lisa.johnson@gmail.com", DisplayName = "Lisa Johnson", Role = 1 },
                new { Email = "marcus.berg@hotmail.com", DisplayName = "Marcus Berg", Role = 0 },
                new { Email = "anna.pettersson@outlook.com", DisplayName = "Anna Pettersson", Role = 0 },
                new { Email = "tom.baker@gmail.com", DisplayName = "Tom Baker", Role = 1 },
            };

            foreach (var user in mockUsers)
            {
                await conn.ExecuteAsync("""
                    IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
                        INSERT INTO Users (Email, DisplayName, MicrosoftId, Role, CreatedAt, LastLoginAt)
                        VALUES (@Email, @DisplayName, '', @Role,
                            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 60, GETUTCDATE()),
                            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 14, GETUTCDATE()));
                    """, user);
            }
    }
}
