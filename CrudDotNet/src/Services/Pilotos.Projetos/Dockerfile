FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Shared/Pilotos.Common/Pilotos.Common.csproj      src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Projetos/Pilotos.Projetos.csproj src/Services/Pilotos.Projetos/
RUN dotnet restore src/Services/Pilotos.Projetos/Pilotos.Projetos.csproj

COPY src/Shared/Pilotos.Common/ src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Projetos/ src/Services/Pilotos.Projetos/
RUN dotnet publish src/Services/Pilotos.Projetos/Pilotos.Projetos.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pilotos.Projetos.dll"]
