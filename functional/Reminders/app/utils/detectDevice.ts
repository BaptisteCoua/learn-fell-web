export interface IBrowserIdentity {
  userAgent: string
  userAgentData?: { platform: string; brands: { brand: string; version: string }[] }
}

export interface IDevice {
  browser: string | null
  system: string | null
}

// Checked in order: Edge and Opera also announce Chrome, and every iOS browser announces Safari.
const BROWSERS: [RegExp, string][] = [
  [/Edg(A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/Firefox\/|FxiOS/, 'Firefox'],
  [/Chrome\/|CriOS/, 'Chrome'],
  [/Safari\//, 'Safari'],
]

// The iPhone announces itself "like Mac OS X", and Android is a Linux.
const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
]

const HINT_BRANDS: [RegExp, string][] = [
  [/Microsoft Edge/, 'Edge'],
  [/Opera/, 'Opera'],
  [/Google Chrome|Chromium/, 'Chrome'],
]

const HINT_PLATFORMS: Record<string, string> = {
  Android: 'Android',
  'Chrome OS': 'ChromeOS',
  iOS: 'iPhone',
  Linux: 'Linux',
  macOS: 'macOS',
  Windows: 'Windows',
}

const firstMatch = (patterns: [RegExp, string][], text: string): string | null =>
  patterns.find(([pattern]) => pattern.test(text))?.[1] ?? null

/**
 * The browser and the system of a device, to name it in the list of devices (research R11).
 * The client hints are more reliable when the browser gives them.
 */
export const detectDevice = ({ userAgent, userAgentData }: IBrowserIdentity): IDevice => {
  const hintedBrowser = userAgentData
    ? firstMatch(HINT_BRANDS, userAgentData.brands.map((item) => item.brand).join(' '))
    : null
  const hintedSystem = userAgentData ? (HINT_PLATFORMS[userAgentData.platform] ?? null) : null

  return {
    browser: hintedBrowser ?? firstMatch(BROWSERS, userAgent),
    system: hintedSystem ?? firstMatch(SYSTEMS, userAgent),
  }
}
