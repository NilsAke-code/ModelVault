using ModelVault.Api.Repositories;

namespace ModelVault.Api.Endpoints;

public static class TagEndpoints
{
    public static void MapTagEndpoints(this WebApplication app)
    {
        app.MapGet("/api/tags", async (TagRepository repo) =>
        {
            var tags = await repo.GetAllAsync();
            return Results.Ok(tags);
        });
    }
}
