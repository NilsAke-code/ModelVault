var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .AddDatabase("modelvaultdb");

var api = builder.AddProject<Projects.ModelVault_Api>("api")
    .WithReference(sql)
    .WaitFor(sql);

builder.AddNpmApp("frontend", "../modelvault-frontend", "dev")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(env: "PORT");

builder.Build().Run();
