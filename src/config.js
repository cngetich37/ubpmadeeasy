// Runtime configuration, read from Vite env vars (see .env and .env.example).
// Vite inlines import.meta.env.VITE_* at build time, so a value changed in the
// hosting dashboard only takes effect after a rebuild.

const required = (name) => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env (or set it in your hosting provider).`
    );
  }
  return value.replace(/\/+$/, ""); // strip trailing slashes
};

/** Base URL of the UBP backend API, e.g. https://effortlessubp-backend.onrender.com */
export const API_URL = required("VITE_API_URL");

/** Public URL of this site; used for the QR codes printed on PDFs. */
export const SITE_URL = required("VITE_SITE_URL");

/** NairobiPay portal where the permit is actually applied for. */
export const NAIROBI_PAY_URL = required("VITE_NAIROBI_PAY_URL");

/** Nairobi City County Finance Act download page. */
export const FINANCE_ACT_URL = required("VITE_FINANCE_ACT_URL");
