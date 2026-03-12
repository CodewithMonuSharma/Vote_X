/**
 * Mock IPFS pinning service.
 * Simulates uploading audit records to IPFS via Pinata.
 * Returns a fake CID that looks authentic.
 */

function randomHex(length) {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function mockPinToIPFS(data) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  const cid = "Qm" + randomHex(44);

  const record = {
    ...data,
    pinnedAt: new Date().toISOString(),
    cid,
  };

  // Store locally for verification
  const existing = JSON.parse(localStorage.getItem("ipfs_records") || "[]");
  existing.push(record);
  localStorage.setItem("ipfs_records", JSON.stringify(existing));

  return {
    cid,
    url: `https://ipfs.io/ipfs/${cid}`,
    record,
  };
}

export function getIPFSRecord(cid) {
  const records = JSON.parse(localStorage.getItem("ipfs_records") || "[]");
  return records.find((r) => r.cid === cid) || null;
}
