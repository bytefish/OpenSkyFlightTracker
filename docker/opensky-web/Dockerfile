# Get the dotnet Build Environment:
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Install nodejs build essentials
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
      build-essential \
      nodejs

WORKDIR /source

# COPY Project Files
COPY ../src/OpenSkyFlightTracker.Web/*.csproj ./OpenSkyFlightTracker.Web/

# Restore NuGet Packages
RUN dotnet restore "OpenSkyFlightTracker.Web/OpenSkyFlightTracker.Web.csproj"

# COPY Projects
COPY ../src/OpenSkyFlightTracker.Web/. ./src/OpenSkyFlightTracker.Web/

RUN dotnet publish ./src/OpenSkyFlightTracker.Web/OpenSkyFlightTracker.Web.csproj -c release -o /app

# Build the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Copy Artifacts from Build:
WORKDIR /app
COPY --from=build /app ./

# Start the Kestrel Server:
ENTRYPOINT ["dotnet", "OpenSkyFlightTracker.Api.dll"]