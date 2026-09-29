/**
 * The VAPID public key as the Push API wants it: bytes, not the base64url text of the .env.
 */
export const applicationServerKey = (base64UrlKey: string): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64UrlKey.length % 4)) % 4)
  const base64 = (base64UrlKey + padding).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)

  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
