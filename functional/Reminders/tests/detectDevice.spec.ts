import { describe, expect, it } from 'vitest'
import { detectDevice } from '../app/utils/detectDevice'

const USER_AGENTS = {
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  ipadChrome:
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0.6668.69 Mobile/15E148 Safari/604.1',
  windowsFirefox:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  windowsEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  linuxChrome:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
}

describe('detectDevice', () => {
  it.each([
    [USER_AGENTS.androidChrome, 'Chrome', 'Android'],
    [USER_AGENTS.iphoneSafari, 'Safari', 'iPhone'],
    [USER_AGENTS.ipadChrome, 'Chrome', 'iPad'],
    [USER_AGENTS.windowsFirefox, 'Firefox', 'Windows'],
    [USER_AGENTS.windowsEdge, 'Edge', 'Windows'],
    [USER_AGENTS.macSafari, 'Safari', 'macOS'],
    [USER_AGENTS.linuxChrome, 'Chrome', 'Linux'],
  ])('reads %s', (userAgent, browser, system) => {
    expect(detectDevice({ userAgent })).toEqual({ browser, system })
  })

  it('prefers the client hints when the browser gives them', () => {
    const device = detectDevice({
      userAgent: USER_AGENTS.linuxChrome,
      userAgentData: {
        platform: 'Android',
        brands: [
          { brand: 'Not A;Brand', version: '99' },
          { brand: 'Google Chrome', version: '129' },
        ],
      },
    })

    expect(device).toEqual({ browser: 'Chrome', system: 'Android' })
  })

  it('leaves out what it does not recognise', () => {
    expect(detectDevice({ userAgent: 'SomeBot/1.0' })).toEqual({ browser: null, system: null })
  })
})
