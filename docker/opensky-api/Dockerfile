# Get the dotnet Build Environment:
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# COPY Project Files
COPY ../src/OpenSkyFlightTracker.Api/*.csproj ./OpenSkyFlightTracker.Api/

# Restore NuGet Packages
RUN dotnet restore "OpenSkyFlightTracker.Api/OpenSkyFlightTracker.Api.csproj"

# COPY Projects
COPY ../src/OpenSkyFlightTracker.Api/. ./src/OpenSkyFlightTracker.Api/

RUN dotnet publish ./src/OpenSkyFlightTracker.Api/OpenSkyFlightTracker.Api.csproj -c release -o /app

# Build the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Copy Artifacts from Build:
WORKDIR /app
COPY --from=build /app ./

# Unzip PBF Fonts
RUN unzip ./wwwroot/fonts/fonts.zip

# Start the Kestrel Server:
ENTRYPOINT ["dotnet", "OpenSkyFlightTracker.Api.dll"]