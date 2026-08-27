FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Gateway/Pilotos.Gateway/Pilotos.Gateway.csproj src/Gateway/Pilotos.Gateway/
RUN dotnet restore src/Gateway/Pilotos.Gateway/Pilotos.Gateway.csproj

COPY src/Gateway/Pilotos.Gateway/ src/Gateway/Pilotos.Gateway/
RUN dotnet publish src/Gateway/Pilotos.Gateway/Pilotos.Gateway.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Pilotos.Gateway.dll"]
