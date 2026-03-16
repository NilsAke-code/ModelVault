var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.ModelVault_Api>("api");

builder.AddNpmApp("frontend", "../modelvault-frontend", "dev")
    .WithReference(api)
    .WaitFor(api)
    .WithHttpEndpoint(env: "PORT");

builder.Build().Run();
