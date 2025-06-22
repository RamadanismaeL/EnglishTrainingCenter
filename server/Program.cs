/*
* Copyright 2025 | Ramadan Ismael
*/

using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.Extensions.FileProviders;
using server.src.Configs;
using server.src.Signalr;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IConverter>(new SynchronizedConverter(new PdfTools()));

ServiceManager.Configure(builder.Services, builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerConfiguration();
}

//app.UseHttpsRedirection();
app.UseWebSockets();
app.UseDefaultFiles();
app.UseStaticFiles(); // Habilita o uso de arquivos estáticos
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads")
    ),
    RequestPath = "/uploads"
});

app.UseCors("etcClient"); // Configura o CORS (Cross-Origin Resource Sharing) para permitir solicitações de outros domínios

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Configura Hubs do SignalR para comunicação em tempo real
// O Hub NotificationHub é responsável por gerenciar as conexões e mensagens entre o servidor e os clientes
app.MapHub<NotificationHub>("/notificationHub", options => {
        options.Transports = HttpTransportType.WebSockets;
    })
    .RequireCors("etcClient")
    .RequireAuthorization();

app.Run();