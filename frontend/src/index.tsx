import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";
import "./opentelemetry.ts"; // OpenTelemetry configuration
import { initializeOpenTelemetry } from "./opentelemetry";

process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
  "http://localhost:4318/v1/traces";
process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = "http://localhost:3001/v1/logs";
const { tracer, logger } = initializeOpenTelemetry();
export { tracer, logger };

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
