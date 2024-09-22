import { Resource } from "@opentelemetry/resources";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import OpenTelemetryLogger from "./logger";
import { LogAttributes, LogLevel, logLevels } from "./types";

let loggerInstance: OpenTelemetryLogger | null = null;

/**
 * Initialize the OpenTelemetry logger.
 * This must be called once before using the logger.
 *
 * @param config - Optional configuration with service name and version.
 */
export function initializeLogger(
  config: { serviceName?: string; version?: string } = {}
) {
  const { serviceName = "default-service", version = "1.0.0" } = config;

  // Define resource attributes
  const resource = new Resource({
    "service.name": serviceName,
    "service.version": version,
  });

  // Initialize the WebTracerProvider with the resource
  const provider = new WebTracerProvider({
    resource,
  });

  // Register the tracer provider globally
  provider.register();

  // Initialize the OpenTelemetryLogger instance
  if (!loggerInstance) {
    loggerInstance = new OpenTelemetryLogger();
  }
}

/**
 * Helper function to check if the logger has been initialized.
 * This ensures that loggerInstance is initialized before use.
 */
function withLogger(
  logLevel: LogLevel,
  message: string,
  attributes: LogAttributes
) {
  if (!loggerInstance) {
    throw new Error(
      "Logger has not been initialized. Call initializeLogger() first."
    );
  }
  loggerInstance[logLevel](message, attributes);
}

// Public API for developers to use
export const logger = {
  debug: (message: string, attributes: LogAttributes = {}) =>
    withLogger(logLevels.DEBUG, message, attributes),
  info: (message: string, attributes: LogAttributes = {}) =>
    withLogger(logLevels.INFO, message, attributes),
  warn: (message: string, attributes: LogAttributes = {}) =>
    withLogger(logLevels.WARN, message, attributes),
  error: (message: string, attributes: LogAttributes = {}) =>
    withLogger(logLevels.ERROR, message, attributes),
};
