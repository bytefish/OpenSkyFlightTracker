FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install nodejs -y

WORKDIR /data
COPY ../data/fonts/fonts.tar.xz ./fonts.tar.xz
 
WORKDIR /source

COPY ../src/OpenSkyFlightTracker.Web.Client/ ./OpenSkyFlightTracker.Web.Client/
COPY ../src/OpenSkyFlightTracker.Web.Server/ ./OpenSkyFlightTracker.Web.Server/

RUN dotnet restore "OpenSkyFlightTracker.Web.Server/OpenSkyFlightTracker.Web.Server.csproj"

WORKDIR /source/OpenSkyFlightTracker.Web.Client
RUN npm install

WORKDIR /source/OpenSkyFlightTracker.Web.Server

RUN dotnet publish -c release -o /app  /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

ADD ../data/fonts/fonts.tar.xz ./wwwroot/assets/fonts

COPY --from=build /app ./

ENTRYPOINT ["dotnet", "OpenSkyFlightTracker.Web.Server.dll"]