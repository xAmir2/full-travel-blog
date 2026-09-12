import axios from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  if (!error.response) {
    return "The backend could not be reached.";
  }

  const body = error.response.data;

  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    return body.errors.join(" ");
  }

  if (body?.message) {
    return body.message;
  }

  switch (error.response.status) {
    case 400:
      return "The submitted data is not valid.";
    case 401:
      return fallbackMessage;
    case 403:
      return "You do not have permission to perform this operation.";
    case 404:
      return "The requested resource was not found.";
    default:
      return fallbackMessage;
  }
}
