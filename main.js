/**
 * Copyright (c) 2021 DRRP-Team (PROPHESSOR)
 * 
 * Move here palettes.bin, wtexels.bin and mappings.bin and run:
 * $> node main.js ; bash extract.sh
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const fs = require('fs');
const path = require('path');

const PALLETES = 'palettes.bin';
const WTEXELS = 'wtexels.bin';
const MAPPINGS = 'mappings.bin';

const PALETTE_SIZE = 16;
const TEXTURE_SIZE = [64, 64];

function main(args) {
  const folder = args[2] || './';

  const palettes = getPalettes(path.join(folder, PALLETES));

  const mappings = getMappings(path.join(folder, MAPPINGS));
  
  const outputFolder = path.join(folder, 'export');

  fs.existsSync(outputFolder) || fs.mkdirSync(outputFolder);

  extractTextures(
    path.join(folder, WTEXELS), // texels
    outputFolder, // output
    
    palettes,
    mappings
  );
}

function getPalettes(file) {
    const buffer = fs.readFileSync(file);
    const numPalettes = buffer.readInt32LE(0);
    const palettes = [];

    for (let paletteId = 4; paletteId < numPalettes + 4;) {
      const palette = [];

      for (let color = 0; color < PALETTE_SIZE; paletteId += 2, color++) {
        const packed = buffer.readUInt16LE(paletteId);

        let r = packed & 0x1F;
        let g = packed >> 5 & 0x3F;
        let b = packed >> 11 & 0x1F;

        // convert to RGB888
        r = r << 3 | (r >> 2);
        g = g << 2 | (g >> 4);
        b = b << 3 | (b >> 2);

        palette.push([r, g, b]);
      }

      palettes.push(palette)
    }

    return palettes;
}

function extractTextures(texelsFile, output, palettes, mappings) {
  const textureBuffer = fs.readFileSync(texelsFile).slice(4);

  for (const [textureId, paletteId] of mappings) {
    const outputBuffer = getTexture(textureBuffer, palettes, textureId, paletteId);

    fs.writeFileSync(
      path.join(output, `texel_${textureId}_palette_${paletteId}.raw`),
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

function getMappings(file) {
  var buffer = fs.readFileSync(file);
  let offset = 0;
  var texturesCount = buffer.readInt32LE(offset);
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

if (require.main === module) main(process.argv)