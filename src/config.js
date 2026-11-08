// Runtime configuration, read from UBP_* env vars. Set them in Vercel for
// deployments, or in a local .env (copy .env.example) for development.
// Vite inlines import.meta.env.UBP_* at build time, so a value changed in the
// hosting dashboard only takes effect after a rebuild.

const required = (name) => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Locally: copy .env.example to .env. On Vercel: add it under Project Settings -> Environment Variables.`
    );
  }
  return value.replace(/\/+$/, ""); // strip trailing slashes
};

/** Base URL of the UBP backend API, e.g. https://effortlessubp-backend.onrender.com */
export const API_URL = required("UBP_API_URL");

/** Public URL of this site; used for the QR codes printed on PDFs. */
export const SITE_URL = required("UBP_SITE_URL");

/** NairobiPay portal where the permit is actually applied for. */
export const NAIROBI_PAY_URL = required("UBP_NAIROBI_PAY_URL");

/** Nairobi City County Finance Act download page. */
export const FINANCE_ACT_URL = required("UBP_FINANCE_ACT_URL");
