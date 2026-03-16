namespace ModelVault.Api.Models;

public class Model3D
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string ThumbnailPath { get; set; } = "";
    public string Category { get; set; } = "";
    public string AuthorId { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public int Downloads { get; set; }
    public int Likes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsExploreModel { get; set; }
    public List<string> Tags { get; set; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class CreateModelRequest
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Tags { get; set; } = "";
}

public class UpdateModelRequest
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Tags { get; set; } = "";
}
