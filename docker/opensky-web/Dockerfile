# Get the dotnet Build Environment:
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install nodejs -y
 
WORKDIR /source

# COPY Project Files
COPY ../src/OpenSkyFlightTracker.Web.Client/ ./OpenSkyFlightTracker.Web.Client/
COPY ../src/OpenSkyFlightTracker.Web.Server/ ./OpenSkyFlightTracker.Web.Server/

# Restore NuGet Packages
RUN dotnet restore "OpenSkyFlightTracker.Web.Server/OpenSkyFlightTracker.Web.Server.csproj"

WORKDIR /source/OpenSkyFlightTracker.Web.Client
RUN npm install
RUN npm run build

WORKDIR /source/OpenSkyFlightTracker.Web.Server
RUN dotnet publish  -c release -o /app

# Build the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Copy Artifacts from Build:
WORKDIR /app
COPY --from=build /app ./

# Start the Kestrel Server:
ENTRYPOINT ["dotnet", "OpenSkyFlightTracker.Web.Server.dll"]