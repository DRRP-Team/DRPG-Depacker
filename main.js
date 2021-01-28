// const PALLETES = '../palettes.bin';
// const WTEXELS = '../wtexels.bin';
// const MAPPINGS = '../mappings.bin';
const PALLETES = 'palettes.bin';
const WTEXELS = 'wtexels.bin';
const MAPPINGS = 'mappings.bin';

const PALETTE_SIZE = 16;
const TEXTURE_SIZE = [64, 64];

function main(args) {
  const a = palette(PALLETES);

  console.log(a);

  const m = mappings(MAPPINGS);

  console.log(m);

  const b = walls2(WTEXELS, a, m);

  console.log(b);
}

const fs = require('fs');

function palette(file) {
    var buffer = fs.readFileSync(file);
    var numColors = buffer.readInt32LE(0);
    const paletteColors = [];

    for (var i = 4; i < numColors + 4;) {
      const palette = [];
      for (var j = 0; j < PALETTE_SIZE; i += 2, j++) {
        var tmp = buffer.readUInt16LE(i);
        var r = tmp & 0x1F;
        var g = tmp >> 5 & 0x3F;
        var b = tmp >> 11 & 0x1F;

        // convert to RGB888
        r = r << 3 | (r >> 2);
        g = g << 2 | (g >> 4);
        b = b << 3 | (b >> 2);

        palette.push([r, g, b]);
      }

      paletteColors.push(palette)
    }
    return paletteColors;
}

function walls2(file, palettes, mappings) {
  const textureBuffer = fs.readFileSync(file).slice(4);

  for (const [textureId, paletteId] of mappings) {

    const outputBuffer = getTexture(textureBuffer, palettes, textureId, paletteId);

    fs.writeFileSync(
      `export/texel_${textureId}_palette_${paletteId}.raw`,
      Buffer.from(outputBuffer)
    );
  }
}

function getTexture(texelsBuffer, palettes, textureId, paletteId) {
  const textureSize = TEXTURE_SIZE[0] * TEXTURE_SIZE[1];

  const outBuffer = [];

  for (let pixelsOffset = 0; pixelsOffset < textureSize; pixelsOffset += 2) {
    const palette = palettes[paletteId];

    // Each uint8 have two uint4 pixels
    const pixels = texelsBuffer[textureId * 2048 + pixelsOffset / 2];
    const pixel1 = pixels & 0xF;
    const pixel2 = pixels >> 4 & 0xF;

    outBuffer.push(...palette[pixel1], ...palette[pixel2]);
  }

  return outBuffer;
}

function mappings(file) {
  var buffer = fs.readFileSync(file);
  let offset = 0;
  var texturesCount = buffer.readInt32LE(offset);
  console.log('found ' + texturesCount + ' mappings');
  offset += 4;
  var spritesCount = buffer.readInt32LE(offset);
  offset += 4;
  offset += 4; // unused
  offset += 4; // unused

  const dict = [];

  for (let i = 0; i < texturesCount; i += 1) {
    const texelId = buffer.readUInt32LE(offset) / (TEXTURE_SIZE[0] * TEXTURE_SIZE[1]);
    offset += 4;
    const paletteId = buffer.readUInt32LE(offset) / PALETTE_SIZE;
    offset += 4;
    dict.push([texelId, paletteId]);
  }
  return dict;
}


main(process.argv)