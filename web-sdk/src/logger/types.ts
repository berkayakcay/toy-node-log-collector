// config.ts
export interface LoggerConfig {
  serviceName: string; // Name of the service
  environment: string; // Deployment environment
  logLevel: LogLevel; // Optional logging level
  logExporterUrl: string; // URL for log exporter
  tracingEnabled: boolean; // Enable or disable tracing
  traceExporterUrl: string; // URL for tracing exporter
  samplingRate: number; // Trace sampling rate (0 to 1)
  metricsEnabled: boolean; // Enable or disable metrics
  metricExporterUrl: string; // URL for metrics exporter
}

export type LogLevel = (typeof logLevels)[keyof typeof logLevels];

export const logLevels = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

// Define a restricted set of allowed attributes
export interface LogAttributes {
  status?: "success" | "failure"; // Optional
  traceId?: string; // Optional
  spanId?: string; // Optional
  sessionId?: string; // Optional
  userId?: string; // Optional
  component?: string; // Optional
  action?: string; // Optional
  elementId?: string; // Optional
  pageUrl?: string; // Optional
  applicationVersion?: string; // Optional
  environment?: string; // Optional
  browserName?: string; // Optional
  browserVersion?: string; // Optional
  osName?: string; // Optional
  osVersion?: string; // Optional
  deviceType?: string; // Optional
  screenResolution?: string; // Optional
  locale?: string; // Optional
  networkStatus?: string; // Optional
}
