import sharp from 'sharp'
import { mkdir, copyFile } from 'node:fs/promises'

await mkdir('public/fonts', { recursive: true })
for (const family of ['manrope', 'dm-sans']) {
  const name = `${family}-latin-wght-normal.woff2`
  await copyFile(`node_modules/@fontsource-variable/${family}/files/${name}`, `public/fonts/${name}`)
  await copyFile(`node_modules/@fontsource-variable/${family}/LICENSE`, `public/fonts/${family}-LICENSE.txt`)
}
await sharp('public/invicto-logo.webp').resize({ width: 360 }).webp({ quality: 90 }).toFile('public/invicto-logo-360.webp')
for (const width of [640, 768, 960, 1600]) {
  await sharp('public/images/traceq-client-dashboard.png').resize({ width, withoutEnlargement: true }).webp({ quality: 88 }).toFile(`public/images/traceq-client-dashboard-${width}.webp`)
}
