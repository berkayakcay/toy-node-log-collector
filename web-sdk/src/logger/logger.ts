// logger.ts (internal logger)
import { trace, context as otelContext } from "@opentelemetry/api";
import {
  logs,
  Logger,
  SeverityNumber,
  AnyValueMap,
} from "@opentelemetry/api-logs";
import { LogAttributes, LogLevel } from "./types";
import { getSessionId, getUserDetails } from "./session";
import { convertLogAttributesToAnyValueMap } from "./mapping";

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
      this.logger = logs.getLogger("logx-lib-logger");
    }
    return this.logger;
  }

  private log(level: LogLevel, message: string, attributes: AnyValueMap = {}) {
    const severity = this.severityMap[level];

    // Get the active span
    const activeSpan = trace.getSpan(otelContext.active());

    // Include trace and span IDs if available
    if (activeSpan) {
      const spanContext = activeSpan.spanContext();
      attributes["traceId"] = spanContext.traceId;
      attributes["spanId"] = spanContext.spanId;
    }

    // Include session and user details
    attributes["sessionId"] = getSessionId();
    const user = getUserDetails();
    if (user) {
      attributes["userId"] = user.id;
    }

    // Emit the log
    const logger = this.getLoggerInstance();
    logger.emit({
      severityNumber: severity.number,
      severityText: severity.text,
      body: message,
      attributes,
      context: otelContext.active(),
    });
  }

  debug(message: string, attributes: LogAttributes = {}) {
    this.log("debug", message, convertLogAttributesToAnyValueMap(attributes));
  }

  info(message: string, attributes: LogAttributes = {}) {
    this.log("info", message, convertLogAttributesToAnyValueMap(attributes));
  }

  warn(message: string, attributes: LogAttributes = {}) {
    this.log("warn", message, convertLogAttributesToAnyValueMap(attributes));
  }

  error(message: string, attributes: LogAttributes = {}) {
    this.log("error", message, convertLogAttributesToAnyValueMap(attributes));
  }
}

// Only export the class for internal use
export default OpenTelemetryLogger;
