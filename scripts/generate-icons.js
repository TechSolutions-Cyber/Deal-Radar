/**
 * Generates Deal Radar PWA icons as PNG files.
 * Run: node scripts/generate-icons.js
 *
 * Creates solid orange (#f97316) icons with a simple "DR" text-like pattern.
 * Uses only Node.js built-ins (zlib, fs, path).
 */

const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// CRC32 table (for PNG chunk CRC)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBuf, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

/**
 * Creates a PNG with a solid background and a centered "radar" cross pattern.
 * bg: [r,g,b] background color
 * fg: [r,g,b] foreground color for the pattern
 */
function createIconPNG(size, bg, fg) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, 8-bit RGB
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 2 // RGB color type
  const ihdr = makeChunk('IHDR', ihdrData)

  // Build raw pixel data (each scanline: filter byte 0 + R,G,B per pixel)
  const scanlineLen = 1 + size * 3
  const rawData = Buffer.alloc(size * scanlineLen)

  const cx = size / 2
  const cy = size / 2

  // Inner circle radius (the "radar dish")
  const outerR = size * 0.38
  const innerR = size * 0.15
  const barW = Math.max(2, Math.round(size * 0.08))
  const cornerR = size * 0.18 // rounded corners

  for (let y = 0; y < size; y++) {
    const base = y * scanlineLen
    rawData[base] = 0 // filter: None

    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Rounded rectangle mask (icon boundary)
      const inIcon =
        x >= cornerR && x < size - cornerR
          ? true
          : y >= cornerR && y < size - cornerR
          ? true
          : Math.sqrt(
                Math.pow(Math.min(x, size - 1 - x) - cornerR, 2) +
                  Math.pow(Math.min(y, size - 1 - y) - cornerR, 2)
              ) <= cornerR
            ? false // outside corner
            : true

      // Radar circle rings
      const onOuterRing = Math.abs(dist - outerR) < barW * 0.7
      const onInnerRing = Math.abs(dist - innerR) < barW * 0.6
      // Center dot
      const onCenter = dist < barW * 1.2
      // Cross / signal bars (horizontal + vertical)
      const onHBar = Math.abs(dy) < barW * 0.5 && dist < outerR + barW
      const onVBar = Math.abs(dx) < barW * 0.5 && dist < outerR + barW

      const isFg = onOuterRing || onInnerRing || onCenter || onHBar || onVBar

      const [r, g, b] = isFg ? fg : bg
      const px = base + 1 + x * 3
      rawData[px] = r
      rawData[px + 1] = g
      rawData[px + 2] = b
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 })
  const idat = makeChunk('IDAT', compressed)
  const iend = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const BG = [249, 115, 22]   // #f97316 orange (brand color)
const FG = [255, 255, 255]  // white pattern

const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

for (const size of SIZES) {
  const png = createIconPNG(size, BG, FG)
  const outPath = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`✓ icon-${size}.png (${png.length} bytes)`)
}

// Also generate badge-72 (monochrome version for push notifications — dark bg, white)
const badge = createIconPNG(72, [30, 30, 46], [249, 115, 22])
fs.writeFileSync(path.join(outDir, 'badge-72.png'), badge)
console.log('✓ badge-72.png')

console.log(`\nAll icons written to ${outDir}`)
