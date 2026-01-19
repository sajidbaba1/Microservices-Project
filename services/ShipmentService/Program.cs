using Amazon.S3;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// --- OpenTelemetry Setup ---
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
        tracerProviderBuilder
            .AddSource("ShipmentService")
            .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("ShipmentService"))
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddOtlpExporter(opt => {
                opt.Endpoint = new Uri("http://localhost:4317");
            }))
    .WithMetrics(metricsProviderBuilder =>
        metricsProviderBuilder
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddPrometheusExporter());

// --- S3 (MinIO) Client ---
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = new AmazonS3Config
    {
        ServiceURL = "http://localhost:9010", // MinIO Port
        ForcePathStyle = true
    };
    return new AmazonS3Client("admin", "password", config);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Metrics Middleware ---
app.UseMetricServer(); // Exposes /metrics
app.UseHttpMetrics();

app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => new { status = "UP", service = "ShipmentService" });

app.Run("http://localhost:5000");
