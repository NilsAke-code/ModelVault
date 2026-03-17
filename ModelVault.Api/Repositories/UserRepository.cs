using Dapper;
using Microsoft.Data.SqlClient;
using ModelVault.Api.Models;

namespace ModelVault.Api.Repositories;

public class UserRepository(IConfiguration configuration)
{
    private SqlConnection CreateConnection() =>
        new(configuration.GetConnectionString("modelvaultdb"));

    public async Task<User?> GetByMicrosoftIdAsync(string microsoftId)
    {
        await using var conn = CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE MicrosoftId = @MicrosoftId",
            new { MicrosoftId = microsoftId });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        await using var conn = CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @Email",
            new { Email = email });
    }

    /// <summary>
    /// Core login flow: find user by MicrosoftId, then by email, or create new.
    /// Handles seeded admin users who have no MicrosoftId yet.
    /// </summary>
    public async Task<User> GetOrCreateAsync(string microsoftId, string email, string displayName)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();

        // Try by Microsoft ID first
        var user = await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE MicrosoftId = @MicrosoftId",
            new { MicrosoftId = microsoftId });

        if (user is not null)
        {
            // Update last login
            await conn.ExecuteAsync(
                "UPDATE Users SET LastLoginAt = GETUTCDATE(), DisplayName = @DisplayName WHERE Id = @Id",
                new { Id = user.Id, DisplayName = displayName });
            user.DisplayName = displayName;
            return user;
        }

        // Try by email (handles seeded admin with no MicrosoftId)
        user = await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @Email",
            new { Email = email });

        if (user is not null)
        {
            // Link Microsoft ID and update
            await conn.ExecuteAsync(
                "UPDATE Users SET MicrosoftId = @MicrosoftId, DisplayName = @DisplayName, LastLoginAt = GETUTCDATE() WHERE Id = @Id",
                new { Id = user.Id, MicrosoftId = microsoftId, DisplayName = displayName });
            user.MicrosoftId = microsoftId;
            user.DisplayName = displayName;
            return user;
        }

        // New user — create with Role=1
        var id = await conn.QuerySingleAsync<int>("""
            INSERT INTO Users (Email, DisplayName, MicrosoftId, Role, CreatedAt, LastLoginAt)
            VALUES (@Email, @DisplayName, @MicrosoftId, 1, GETUTCDATE(), GETUTCDATE());
            SELECT SCOPE_IDENTITY();
            """, new { Email = email, DisplayName = displayName, MicrosoftId = microsoftId });

        return new User
        {
            Id = id,
            Email = email,
            DisplayName = displayName,
            MicrosoftId = microsoftId,
            Role = 1,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        await using var conn = CreateConnection();
        return await conn.QueryAsync<User>("SELECT * FROM Users ORDER BY CreatedAt DESC");
    }

    public async Task UpdateRoleAsync(int userId, int role)
    {
        await using var conn = CreateConnection();
        await conn.ExecuteAsync(
            "UPDATE Users SET Role = @Role WHERE Id = @Id",
            new { Id = userId, Role = role });
    }

    public async Task<AdminStats> GetStatsAsync()
    {
        await using var conn = CreateConnection();
        return await conn.QuerySingleAsync<AdminStats>("""
            SELECT
                (SELECT COUNT(*) FROM Models) AS TotalModels,
                (SELECT COUNT(*) FROM Users) AS TotalUsers,
                (SELECT ISNULL(SUM(Downloads), 0) FROM Models) AS TotalDownloads,
                (SELECT ISNULL(SUM(Likes), 0) FROM Models) AS TotalLikes,
                (SELECT COUNT(*) FROM Models WHERE CreatedAt >= DATEADD(DAY, -7, GETUTCDATE())) AS ModelsLast7Days,
                (SELECT COUNT(*) FROM Models WHERE CreatedAt >= DATEADD(DAY, -30, GETUTCDATE())) AS ModelsLast30Days,
                (SELECT COUNT(*) FROM Users WHERE CreatedAt >= DATEADD(DAY, -7, GETUTCDATE())) AS UsersLast7Days,
                (SELECT COUNT(*) FROM Users WHERE CreatedAt >= DATEADD(DAY, -30, GETUTCDATE())) AS UsersLast30Days
            """);
    }
}
