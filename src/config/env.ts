import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().url("Must be a valid MongoDB connection string"),
  MONGODB_DB_NAME: z.string().min(1, "Database name is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NextAuth secret is required"),
  NEXTAUTH_URL: z.string().url("Must be a valid URL"),
  NEXT_PUBLIC_APP_URL: z.string().url("Must be a valid public app URL"),
  NEXT_PUBLIC_API_URL: z.string().url("Must be a valid public API URL"),
  PERFORMANCE_PREDICTOR_API_URL: z
    .string()
    .url("Must be a valid ML service URL"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .min(1, "Razorpay public key is required"),
  RAZORPAY_KEY_ID: z.string().min(1, "Razorpay key ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "Razorpay secret is required"),
  NEXT_PUBLIC_VAPI_PUBLIC_KEY: z.string().min(1, "Vapi public key is required"),
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: z
    .string()
    .min(1, "Vapi assistant ID is required"),
  NEXT_PUBLIC_VAPI_WEB_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required").optional(),
  NEXT_PUBLIC_OPENAI_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_BASE: z.string().url().optional(),
  OPENROUTER_MODEL: z.string().min(1).optional(),
});

export const validateEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error(
      "Invalid environment variables. See console output for missing or invalid keys.",
    );
  }
};
