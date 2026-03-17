namespace ModelVault.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string MicrosoftId { get; set; } = "";
    public int Role { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public DateTime LastLoginAt { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public int Role { get; set; }
}

public class AdminStats
{
    public int TotalModels { get; set; }
    public int TotalUsers { get; set; }
    public int TotalDownloads { get; set; }
    public int TotalLikes { get; set; }
    public int ModelsLast7Days { get; set; }
    public int ModelsLast30Days { get; set; }
    public int UsersLast7Days { get; set; }
    public int UsersLast30Days { get; set; }
}

public class UpdateRoleRequest
{
    public int Role { get; set; }
}
