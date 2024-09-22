import { AnyValue, AnyValueMap } from "@opentelemetry/api-logs";
import { LogAttributes } from "./types";

// Function to convert LogAttributes to AnyValueMap dynamically
export function convertLogAttributesToAnyValueMap(
  attributes: LogAttributes
): AnyValueMap {
  const anyValueMap: AnyValueMap = {};

  // Iterate over each key-value pair in LogAttributes
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      const value = attributes[key as keyof LogAttributes];

      // Only add to AnyValueMap if the value is defined
      if (value !== undefined && value !== null) {
        anyValueMap[key] = value as AnyValue;
      }
    }
  }

  return anyValueMap;
}
