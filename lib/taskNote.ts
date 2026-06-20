/** Parse warehouse task notes (especially garage pick requests). */
export type ParsedTaskNote = {
  rush: boolean;
  orderRef: string | null;
  requestedBy: string | null;
  instructions: string | null;
  raw: string;
};

export function parseTaskNote(note?: string | null): ParsedTaskNote | null {
  const raw = (note || "").trim();
  if (!raw) return null;

  const parts = raw.split(" · ").map((p) => p.trim()).filter(Boolean);
  let rush = false;
  let orderRef: string | null = null;
  let requestedBy: string | null = null;
  const instructions: string[] = [];

  for (const part of parts) {
    if (part.toUpperCase() === "RUSH") {
      rush = true;
      continue;
    }
    const storeMatch = part.match(/^Store:(.+)$/i);
    if (storeMatch) {
      orderRef = storeMatch[1];
      continue;
    }
    if (orderRef && !requestedBy) {
      requestedBy = part;
      continue;
    }
    instructions.push(part);
  }

  if (!orderRef && !rush && parts.length === 1) {
    return {
      rush: false,
      orderRef: null,
      requestedBy: null,
      instructions: raw,
      raw,
    };
  }

  return {
    rush,
    orderRef,
    requestedBy,
    instructions: instructions.length ? instructions.join(" · ") : null,
    raw,
  };
}
