/**
 * Zero-Knowledge-style commitment generator.
 * Uses SHA-256 to create a commitment hash from voterID + secret.
 * The raw identity is never stored on-chain — only this hash.
 */

export async function generateCommitment(voterId, secret) {
  const data = voterId + ":" + secret;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex =
    "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export function truncateHash(hash, startLen = 10, endLen = 6) {
  if (!hash || hash.length <= startLen + endLen) return hash;
  return hash.slice(0, startLen) + "..." + hash.slice(-endLen);
}
