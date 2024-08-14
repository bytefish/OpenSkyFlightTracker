FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

COPY ../src/OpenSkyFlightTracker.Api/*.csproj ./OpenSkyFlightTracker.Api/

RUN dotnet restore "OpenSkyFlightTracker.Api/OpenSkyFlightTracker.Api.csproj"

COPY ../src/OpenSkyFlightTracker.Api/. ./src/OpenSkyFlightTracker.Api/

RUN dotnet publish ./src/OpenSkyFlightTracker.Api/OpenSkyFlightTracker.Api.csproj -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build /app ./

ENTRYPOINT ["dotnet", "OpenSkyFlightTracker.Api.dll"]