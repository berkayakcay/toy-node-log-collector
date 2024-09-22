import { LoggerConfig, LogLevel } from "./types";

export class LoggerConfigBuilder {
  private config: Partial<LoggerConfig> = {
    serviceName: "default-service",
    environment: "development",
    logLevel: "info",
    logExporterUrl: "http://localhost:4318/v1/logs",
  };

  // Set service name
  setServiceName(serviceName: string): LoggerConfigBuilder {
    this.config.serviceName = serviceName;
    return this;
  }

  // Set environment
  setEnvironment(environment: string): LoggerConfigBuilder {
    this.config.environment = environment;
    return this;
  }

  // Set log level
  setLogLevel(logLevel: LogLevel): LoggerConfigBuilder {
    this.config.logLevel = logLevel;
    return this;
  }

  // Set log exporter URL
  setLogExporterUrl(url: string): LoggerConfigBuilder {
    this.config.logExporterUrl = url;
    return this;
  }

  // Build the final configuration object
  build(): LoggerConfig {
    return this.config as LoggerConfig;
  }
}
