export const viewports = [
  [320, 568],
  [360, 640],
  [375, 667],
  [390, 844],
  [393, 851],
  [412, 915],
  [430, 932],
  [600, 960],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
  [667, 375],
].map(([width, height]) => ({
  name: `${width}x${height}`,
  viewport: { width, height },
  orientation: width > height ? 'landscape' : 'portrait',
}))

export function deviceMatrix(devices) {
  // Galaxy S23 is not a built-in descriptor in every Playwright version.
  const selections = [
    'iPhone SE',
    'iPhone 13',
    'iPhone 15 Pro Max',
    'Pixel 7',
    'Galaxy S23',
    'iPad',
    'iPad Pro 11',
  ]
  return selections.flatMap((name) => {
    const descriptor =
      devices[name] ??
      (name === 'Galaxy S23'
        ? {
            viewport: { width: 360, height: 780 },
            screen: { width: 360, height: 780 },
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
            userAgent:
              'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            defaultBrowserType: 'chromium',
          }
        : devices[name === 'iPad' ? 'iPad (gen 7)' : 'iPad Pro 11'])
    if (!descriptor) throw new Error(`Missing device descriptor: ${name}`)
    const { defaultBrowserType, ...options } = descriptor
    return ['portrait', 'landscape'].map((orientation) => ({
      name,
      orientation,
      custom: !devices[name],
      preferredEngine: defaultBrowserType,
      options: {
        ...options,
        viewport:
          orientation === 'portrait'
            ? options.viewport
            : { width: options.viewport.height, height: options.viewport.width },
      },
    }))
  })
}
