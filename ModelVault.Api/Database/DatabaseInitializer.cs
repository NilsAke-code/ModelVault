using Dapper;
using Microsoft.Data.SqlClient;

namespace ModelVault.Api.Database;

public class DatabaseInitializer(IConfiguration configuration)
{
    public async Task InitializeAsync()
    {
        var connectionString = configuration.GetConnectionString("modelvaultdb");
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await connection.ExecuteAsync("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Models')
            BEGIN
                CREATE TABLE Models (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Title NVARCHAR(200) NOT NULL,
                    Description NVARCHAR(MAX) NOT NULL DEFAULT '',
                    FilePath NVARCHAR(500) NOT NULL DEFAULT '',
                    ThumbnailPath NVARCHAR(500) NOT NULL DEFAULT '',
                    Category NVARCHAR(100) NOT NULL DEFAULT '',
                    AuthorId NVARCHAR(200) NOT NULL DEFAULT '',
                    AuthorName NVARCHAR(200) NOT NULL DEFAULT '',
                    Downloads INT NOT NULL DEFAULT 0,
                    Likes INT NOT NULL DEFAULT 0,
                    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                    IsExploreModel BIT NOT NULL DEFAULT 0
                );
            END
            """);

        await connection.ExecuteAsync("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tags')
            BEGIN
                CREATE TABLE Tags (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Name NVARCHAR(100) NOT NULL UNIQUE
                );
            END
            """);

        await connection.ExecuteAsync("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModelTags')
            BEGIN
                CREATE TABLE ModelTags (
                    ModelId INT NOT NULL,
                    TagId INT NOT NULL,
                    PRIMARY KEY (ModelId, TagId),
                    FOREIGN KEY (ModelId) REFERENCES Models(Id) ON DELETE CASCADE,
                    FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE
                );
            END
            """);

        await connection.ExecuteAsync("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
            BEGIN
                CREATE TABLE Users (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Email NVARCHAR(320) NOT NULL UNIQUE,
                    DisplayName NVARCHAR(200) NOT NULL DEFAULT '',
                    MicrosoftId NVARCHAR(200) NOT NULL DEFAULT '',
                    Role INT NOT NULL DEFAULT 1,
                    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                    LastLoginAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                );
            END
            """);

        await connection.ExecuteAsync("""
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DownloadHistory')
            BEGIN
                CREATE TABLE DownloadHistory (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    ModelId INT NOT NULL,
                    UserId INT NOT NULL,
                    DownloadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                    FOREIGN KEY (ModelId) REFERENCES Models(Id) ON DELETE CASCADE,
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
                );
                CREATE INDEX IX_DownloadHistory_ModelId ON DownloadHistory(ModelId);
                CREATE INDEX IX_DownloadHistory_UserId ON DownloadHistory(UserId);
            END
            """);

        // Seed admin user from config
        var adminEmail = configuration["AdminSettings:Email"];
        if (!string.IsNullOrEmpty(adminEmail) && !adminEmail.Contains("YOUR_"))
        {
            await connection.ExecuteAsync("""
                IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
                    INSERT INTO Users (Email, DisplayName, Role, CreatedAt, LastLoginAt)
                    VALUES (@Email, 'Admin', 2, GETUTCDATE(), GETUTCDATE());
                """, new { Email = adminEmail });
        }
    }
}
