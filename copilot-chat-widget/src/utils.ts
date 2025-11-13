import { ACSMessage, ACSMessageLocal, OmnichannelMessageOptional } from "./types";


export function timeout(ms: number) {
  // eslint-disable-next-line no-restricted-globals
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export      const getTwoRandomIntegers = (max: number): [number, number] => {
        if (max <= 1) throw new Error("Input must be greater than 1");
        const first = Math.floor(Math.random() * (max - 1));
        const second = Math.floor(Math.random() * (max - first - 1)) + first + 1;
        return [first, second];
      }


export const cloneDeepACSMessage = (message: ACSMessage) => {
    if (!message) return null;
    return JSON.parse(JSON.stringify(message));
}


/**
 * Extracts the value after 'client_activity_id:' from an array of strings.
 * Returns undefined if not found.
 */
export function extractClientActivityId(tags: string[]): string | undefined {
  const prefix = 'client_activity_id:';
  for (const tag of tags) {
    if (tag.startsWith(prefix)) {
      return tag.slice(prefix.length);
    }
  }
  return undefined;
}


export const isAdaptiveCardMessage = (message: ACSMessageLocal): [boolean, any | null] => {
  //return [false, null]
  if (!message || !message.content) return [false, null];

  const raw = message.content;

  if (!raw.includes("attachments") || !raw.includes("contentType") || !raw.includes("application/vnd.microsoft.card.adaptive")) return [false, null];
  let parsed: any = null;
  if (typeof raw === 'string') {
    parsed =tryParseJSON(raw);
    //console.log("debugging: parsed raw?", parsed, " raw: ", raw);
    if (!parsed) return [false, null];
  } else if (typeof raw === 'object') {
    //console.log("debugging: parsed object: ", raw);
    parsed = raw[0] ? (raw[0] as any).content: ""; 
  } else {
    return [false, null];
  }

  const attachments = parsed.attachments ?? parsed.attachments;
  if (!Array.isArray(attachments) || attachments.length === 0) return [false, parsed];

  const first = attachments[0];
  if (first && first.contentType === 'application/vnd.microsoft.card.adaptive') {
    // const isHTMLRenderingSupport = true;
    let content = first.content;
    // if (isHTMLRenderingSupport) {
    //   content = decodeHtmlEntities(content);
    //   console.log("debugging: output from decode: ", content);
    // }
    const cardPayload = tryParseJSON(content);
    console.log("debugging: parsed card object: ", cardPayload);
    return [true, cardPayload];
  }

  return [false, parsed];
}

export function tryParseJSON<T = any>(input: string): T | null {
  if (typeof input !== 'string') return null;
  try {
    return JSON.parse(input) as T;
  } catch (e) {
    return null;
  }
}

export function decodeHtmlEntities(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // // Use DOMParser if available
  // if (typeof window !== 'undefined' && 'DOMParser' in window) {
  //   try {
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(input, 'text/html');
  //     return doc.documentElement.textContent ?? '';
  //   } catch (e) {
  //     // fallback to textarea method
  //   }
  // }

  // // // Fallback: textarea decoding
  // if (typeof document !== 'undefined') {
  //   const txt = document.createElement('textarea');
  //   txt.innerHTML = input;
  //   return txt.value;
  // }

  // As a last resort, replace a few common entities
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}


export const isAttachmentMessage = (message: ACSMessageLocal) => {
  return !!message?.fileMetadata?.id
}


export const processInputMsgArr = (rawMessages: OmnichannelMessageOptional[]) => {
  return rawMessages.map(msg => {
    return {
      ...msg,
      clientActivityId: extractClientActivityId(msg.tags ?? []),
    } as ACSMessageLocal
  })
}
