import DOMPurify from "isomorphic-dompurify"

export function sanitizeHTML(input: string) {
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: true } })
}
