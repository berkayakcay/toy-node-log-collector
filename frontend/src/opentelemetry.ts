import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { LoggerProvider } from "@opentelemetry/sdk-logs";
import { Resource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import {
  context,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
} from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";

export function initializeOpenTelemetry() {
  // Set up internal diagnostic logging (optional)
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  // Step 1: Define resource attributes
  const resource = new Resource({
    "service.name": "your-react-app",
    "service.version": "1.0.0",
    "deployment.environment": process.env.NODE_ENV || "development",
  });

  // Initialize the tracer provider
  const tracerProvider = new WebTracerProvider({
    resource,
  });

  // Configure the trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: "http://localhost:3001/v1/traces", // Correct traces endpoint
  });

  // Add a span processor and exporter to the tracer provider
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));

  // Register the tracer provider with a context manager
  const contextManager = new ZoneContextManager();
  // Register the context manager globally
  context.setGlobalContextManager(contextManager);

  // Register the tracer provider
  tracerProvider.register();

  // Initialize the logger provider
  const loggerProvider = new LoggerProvider({
    resource,
  });

  // Configure the log exporter
  const logExporter = new OTLPLogExporter({
    url: "http://localhost:3001/v1/logs", // Logs endpoint
  });

  // Add a log record processor and exporter to the logger provider
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(logExporter)
  );

  // Set the global logger provider
  logs.setGlobalLoggerProvider(loggerProvider);

  // Register automatic instrumentations
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation(),
    ],
    tracerProvider,
    loggerProvider,
  });

  // Get the tracer and logger
  const tracer = tracerProvider.getTracer("logx-react-app-tracer");
  const logger = loggerProvider.getLogger("logx-react-app-logger");

  // Return the tracer and logger
  return { tracer, logger };
}
