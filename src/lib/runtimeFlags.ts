/**
 * Runtime flags used to keep Live Preview unblocked.
 *
 * NOTE: Must be safe when evaluated in non-browser environments.
 */

export const isBrowser = (): boolean => typeof window !== "undefined";

export const isLivePreview = (): boolean => {
  if (!isBrowser()) return false;

  const host = window.location.hostname || "";

  // Lovable Live Preview hosts
  if (host.includes("lovableproject.com")) return true;
  if (host.startsWith("id-preview--")) return true;
  if (host.includes("-preview--") && host.endsWith(".lovable.app")) return true;

  return false;
};

export const areAnimationsEnabled = (): boolean => {
  // Critical fix: disable animations in Live Preview.
  return !isLivePreview();
};
