// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Serilog;
using Serilog.Filters;
using Serilog.Sinks.SystemConsole.Themes;

public partial class Program
{
    private static async Task Main(string[] args)
    {
        // We will log to %LocalAppData%/GitClub to store the Logs, so it doesn't need to be configured 
        // to a different path, when you run it on your machine.
        string logDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GitClub");

        // We are writing with RollingFileAppender using a daily rotation, and we want to have the filename as 
        // as "GitClub-{Date}.log", the date will be set by Serilog automagically.
        string logFilePath = Path.Combine(logDirectory, "OpenSkyFlightTracker-Web-.log");

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

            builder.Services.AddControllers();

            var app = builder.Build();

            app.UseHttpsRedirection();
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (app.Environment.IsDevelopment())
                {
                    // use the external angular CLI server instead
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
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