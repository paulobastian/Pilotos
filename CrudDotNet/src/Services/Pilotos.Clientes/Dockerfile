FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Shared/Pilotos.Common/Pilotos.Common.csproj      src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Clientes/Pilotos.Clientes.csproj src/Services/Pilotos.Clientes/
RUN dotnet restore src/Services/Pilotos.Clientes/Pilotos.Clientes.csproj

COPY src/Shared/Pilotos.Common/ src/Shared/Pilotos.Common/
COPY src/Services/Pilotos.Clientes/ src/Services/Pilotos.Clientes/
RUN dotnet publish src/Services/Pilotos.Clientes/Pilotos.Clientes.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pilotos.Clientes.dll"]
