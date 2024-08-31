/* Customized classes */

import { Alert } from "react-native";

// Error
// Customize error name and message
export function createError(title, message) {
  let error = new Error(message);
  error.name = title;
  return error;
}