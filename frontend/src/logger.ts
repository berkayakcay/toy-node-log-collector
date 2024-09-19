// logger.ts

import { trace, context as otelContext } from "@opentelemetry/api";
import { logs, Logger, SeverityNumber } from "@opentelemetry/api-logs";

// Define the log levels
const logLevels = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

type LogLevel = (typeof logLevels)[keyof typeof logLevels];

interface LogAttributes {
  [key: string]: any;
}

class OpenTelemetryLogger {
  private logger: Logger | null = null;

  private severityMap: Record<
    LogLevel,
    { number: SeverityNumber; text: string }
  > = {
    debug: { number: SeverityNumber.DEBUG, text: "DEBUG" },
    info: { number: SeverityNumber.INFO, text: "INFO" },
    warn: { number: SeverityNumber.WARN, text: "WARN" },
    error: { number: SeverityNumber.ERROR, text: "ERROR" },
  };

  private getLoggerInstance(): Logger {
    if (!this.logger) {
      this.logger = logs.getLogger("logx-react-app-logger");
    }
    return this.logger;
  }

  log(level: LogLevel, message: string, attributes: LogAttributes = {}) {
    const severity = this.severityMap[level];

    // Get the active span
    const activeSpan = trace.getSpan(otelContext.active());

    // Include trace and span IDs if available
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();
      attributes["traceId"] = spanContext.traceId;
      attributes["spanId"] = spanContext.spanId;
    }

    // Include session details (implement getSessionId() accordingly)
    attributes["sessionId"] = getSessionId();

    // Get the logger instance
    const logger = this.getLoggerInstance();

    // Emit the log record
    logger.emit({
      severityNumber: severity.number,
      severityText: severity.text,
      body: message,
      attributes,
      context: otelContext.active(),
    });
  }

  debug(message: string, attributes: LogAttributes = {}) {
    this.log("debug", message, attributes);
  }

  info(message: string, attributes: LogAttributes = {}) {
    this.log("info", message, attributes);
  }

  warn(message: string, attributes: LogAttributes = {}) {
    this.log("warn", message, attributes);
  }

  error(message: string, attributes: LogAttributes = {}) {
    this.log("error", message, attributes);
  }
}

// Implement your session ID retrieval logic
function getSessionId(): string {
  // Replace with your actual session ID retrieval method
  return sessionStorage.getItem("sessionId") || "unknown-session";
}

// Export an instance of the logger
export const otelLogger = new OpenTelemetryLogger();

let otelLoggerInstance: OpenTelemetryLogger | null = null;

export function getOtelLogger(): OpenTelemetryLogger {
  if (!otelLoggerInstance) {
    otelLoggerInstance = new OpenTelemetryLogger();
  }
  return otelLoggerInstance;
}
