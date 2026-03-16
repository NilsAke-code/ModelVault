namespace ModelVault.Api.Services;

public class FileStorageService
{
    private readonly string _uploadPath;

    public FileStorageService(IConfiguration configuration)
    {
        _uploadPath = configuration["FileStorage:UploadPath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(Path.Combine(_uploadPath, "models"));
        Directory.CreateDirectory(Path.Combine(_uploadPath, "thumbnails"));
    }

    public async Task<string> SaveModelFileAsync(IFormFile file)
    {
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(_uploadPath, "models", fileName);
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"models/{fileName}";
    }

    public async Task<string> SaveThumbnailAsync(IFormFile file)
    {
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(_uploadPath, "thumbnails", fileName);
        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"thumbnails/{fileName}";
    }

    public string GetFullPath(string relativePath) =>
        Path.Combine(_uploadPath, relativePath);

    public void DeleteFile(string relativePath)
    {
        var fullPath = GetFullPath(relativePath);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }
}
