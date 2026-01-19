package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

func initTracer() (*sdktrace.TracerProvider, error) {
	ctx := context.Background()

	exporter, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithInsecure(),
		otlptracegrpc.WithEndpoint("localhost:4317"),
	)
	if err != nil {
		return nil, err
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String("inventory-service"),
		)),
	)
	otel.SetTracerProvider(tp)
	return tp, nil
}

func main() {
	// Initialize OTEL
	tp, err := initTracer()
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = tp.Shutdown(context.Background()) }()

	r := gin.Default()

	// Prometheus Metrics Endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP", "service": "inventory-service"})
	})

	// Sample Inventory Endpoint
	r.GET("/items", func(c *gin.Context) {
		tr := otel.Tracer("inventory-api")
		_, span := tr.Start(c.Request.Context(), "get-items")
		defer span.End()

		time.Sleep(50 * time.Millisecond) // Simulate DB work

		c.JSON(http.StatusOK, gin.H{
			"items": []string{"Server-Rack", "Kafka-Broker-X1", "Postgres-Disk-SSD"},
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	log.Println("[inventory-service]: Running on http://localhost:8080")
	r.Run(":8080")
}
