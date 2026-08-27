# build a partir da raiz do repositorio:
#   docker build -f src/Services/Pilotos.Auth/Dockerfile .
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Shared/Pilotos.Common/Pilotos.Common.csproj src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Auth/Pilotos.Auth.csproj  src/Services/Pilotos.Auth/
RUN dotnet restore src/Services/Pilotos.Auth/Pilotos.Auth.csproj

COPY src/Shared/Pilotos.Common/ src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Auth/ src/Services/Pilotos.Auth/
RUN dotnet publish src/Services/Pilotos.Auth/Pilotos.Auth.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pilotos.Auth.dll"]
