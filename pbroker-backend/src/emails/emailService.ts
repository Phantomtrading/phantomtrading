import { Resend } from "resend";
import { EMAIL_FROM, RESEND_API_KEY } from "../common/config/envVariables.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
} from "../common/error/index.error.js";

const resendErrorGroups = {
  400: ["invalid_idempotency_key"],
  401: ["missing_api_key"],
  403: ["invalid_api_Key", "invalid_from_address", "validation_error"],
  404: ["not_found"],
  409: ["invalid_idempotent_request", "concurrent_idempotent_requests"],
  422: [
    "missing_required_field",
    "invalid_access",
    "invalid_parameter",
    "invalid_region",
  ],
  429: ["rate_limit_exceeded"],
  500: ["application_error", "internal_server_error"],
};

const errorMessages: Record<number, string> = {
  400: "Bad request.",
  401: "Unauthorized: API key missing or invalid.",
  403: "Forbidden: Access denied.",
  404: "Not found.",
  409: "Conflict: Duplicate or concurrent request.",
  422: "Unprocessable entity: Invalid or missing parameters.",
  429: "Too many requests: Rate limit exceeded.",
  500: "Internal server error. Please try again later.",
};

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}
if (!EMAIL_FROM) {
  throw new Error("EMAIL_FROM environment variable is not set");
}

const resend = new Resend(RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}
export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);

      // Find status code for error.name
      const statusCode = Object.entries(resendErrorGroups).find(([_, codes]) =>
        codes.includes(error.name)
      )?.[0];

      const code = statusCode ? Number(statusCode) : 500;
      const message = errorMessages[code] || "Unknown email error";

      switch (code) {
        case 400:
        case 422:
          throw new BadRequestError(message);
        case 401:
          throw new UnauthorizedError(message);
        case 403:
          throw new ForbiddenError(message);
        case 404:
          throw new NotFoundError(message);
        case 409:
          throw new ConflictError(message);
        case 429:
          throw new RateLimitError(message);
        default:
          throw new InternalServerError(message);
      }
    }

    return data;
  } catch (error: any) {
    console.error("sendEmail failed:", error);
    throw error;
  }
};
