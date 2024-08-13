// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Serilog.Filters;
using Serilog.Sinks.SystemConsole.Themes;
using Serilog;
using OpenSkyFlightTracker.Api.Services;
using OpenSkyRestClient;
using OpenSkyFlightTracker.Api.Options;
using Microsoft.AspNetCore.Cors.Infrastructure;

public partial class Program
{
    private static async Task Main(string[] args)
    {
        // We will log to %LocalAppData%/GitClub to store the Logs, so it doesn't need to be configured 
        // to a different path, when you run it on your machine.
        string logDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GitClub");

        // We are writing with RollingFileAppender using a daily rotation, and we want to have the filename as 
        // as "GitClub-{Date}.log", the date will be set by Serilog automagically.
        string logFilePath = Path.Combine(logDirectory, "OpenSkyFlightTracker-.log");

        // Configure the Serilog Logger. This Serilog Logger will be passed 
        // to the Microsoft.Extensions.Logging LoggingBuilder using the 
        // LoggingBuilder#AddSerilog(...) extension.
        Log.Logger = new LoggerConfiguration()
            .Filter.ByExcluding(Matching.FromSource("Microsoft.AspNetCore.Diagnostics.ExceptionHandlerMiddleware"))
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithEnvironmentName()
            .WriteTo.Console(theme: AnsiConsoleTheme.Code)
            .WriteTo.File(logFilePath, rollingInterval: RollingInterval.Day)
            .CreateLogger();

        try
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables()
                .AddUserSecrets<Program>();

            // Logging
            builder.Services.AddLogging(loggingBuilder => loggingBuilder.AddSerilog(dispose: true));


            // CORS
            builder.Services.AddCors(options =>
            {
                var allowedOrigins = builder.Configuration
                    .GetSection("AllowedOrigins")
                    .Get<string[]>();

                if (allowedOrigins == null)
                {
                    throw new InvalidOperationException("AllowedOrigins is missing in the appsettings.json");
                }

                options.AddPolicy("CorsPolicy", builder => builder
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
            });

            // Options
            builder.Services.Configure<ApplicationOptions>(builder.Configuration.GetSection("Application"));

            // Infrastructure (Tileserver)
            builder.Services.AddSingleton<OpenSkyClient>();
            builder.Services.AddSingleton<MapboxTileService>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddControllers();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // CORS
            app.UseCors("CorsPolicy");

            app.UseHttpsRedirection();

            // To serve PBF Files, we need to allow unknown filetypes 
            // to be served by the Webserver:
            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = true,
                OnPrepareResponse = (ctx) =>
                {
                    var corsService = ctx.Context.RequestServices.GetRequiredService<ICorsService>();
                    var corsPolicyProvider = ctx.Context.RequestServices.GetRequiredService<ICorsPolicyProvider>();
                    
                    var policy = corsPolicyProvider.GetPolicyAsync(ctx.Context, "CorsPolicy")
                        .ConfigureAwait(false)
                        .GetAwaiter().GetResult();

                    if (policy != null)
                    {
                        var corsResult = corsService.EvaluatePolicy(ctx.Context, policy);

                        corsService.ApplyResult(corsResult, ctx.Context.Response);
                    }
                }
            });

            app.MapControllers();

            app.Run();
        }
        catch (Exception exception)
        {
            Log.Fatal(exception, "An unhandeled exception occured.");
        }
        finally
        {
            // Wait 0.5 seconds before closing and flushing, to gather the last few logs.
            await Task.Delay(TimeSpan.FromMilliseconds(500));
            await Log.CloseAndFlushAsync();
        }
    }
}

public partial class Program { }