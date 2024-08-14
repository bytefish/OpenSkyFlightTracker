using Microsoft.AspNetCore.Cors.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

app.UseDefaultFiles();

// We need to serve PBF files, so activate the unknown file handling:
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
});

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
