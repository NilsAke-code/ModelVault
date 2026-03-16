using Dapper;
using Microsoft.Data.SqlClient;
using ModelVault.Api.Models;

namespace ModelVault.Api.Repositories;

public class TagRepository(IConfiguration configuration)
{
    public async Task<IEnumerable<Tag>> GetAllAsync()
    {
        await using var conn = new SqlConnection(configuration.GetConnectionString("modelvaultdb"));
        return await conn.QueryAsync<Tag>("SELECT * FROM Tags ORDER BY Name");
    }
}
