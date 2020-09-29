# Get the dotnet Build Environment:
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /source

# COPY Project Files:
COPY *.sln .
COPY ./OpenSkyBackend/*.csproj ./OpenSkyBackend/

# And restore the NuGet Packages:
RUN dotnet restore

# COPY 
COPY OpenSkyBackend/. ./OpenSkyBackend/
WORKDIR /source/OpenSkyBackend
RUN dotnet publish -c release -o /app --no-restore

# Build the final image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-focal

# Copy Artifacts from Build:
WORKDIR /app
COPY --from=build /app ./

# And kick off the Server:
ENTRYPOINT ["dotnet", "OpenSkyBackend.dll"]