// const PALLETES = '../palettes.bin';
// const WTEXELS = '../wtexels.bin';
// const MAPPINGS = '../mappings.bin';
const PALLETES = 'palettes.bin';
const WTEXELS = 'wtexels.bin';
const MAPPINGS = 'mappings.bin';

const PALETTE_SIZE = 16;
const TEXTURE_SIZE = [64, 64];

const PALETTE_SIZE_0 = PALETTE_SIZE - 1;

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
        r = r << 3 | (r >> 2);
        var g = tmp >> 5 & 0x3F;
        g = g << 2 | (g >> 4);
        var b = tmp >> 11 & 0x1F;
        b = b << 3 | (b >> 2);
        var color = (0xFF000000 | r << 16 | g << 8 | b << 0);
        palette.push(color);
      }

      paletteColors.push(palette)
    }
    return paletteColors;
}

function walls2(file, palettes, mappings) {
  var texels = fs.readFileSync(file);
  var textureBuffer = texels.slice(4);
  var outputBuffer = [];
  let i = 0;

  const textureSize = TEXTURE_SIZE[0] * TEXTURE_SIZE[1];

  for (const [texoffset, palid] of mappings) {

    for (var j = texoffset; j < texoffset + textureSize; j++) {
      const pixel = textureBuffer[j];
      var color1 = palettes[palid][pixel & 0xF]; //(textureBuffer[j] & 0xF) + i];
      var red1 = 0xFF & (color1 >> 16);
      var green1 = 0xFF & (color1 >> 8);
      var blue1 = 0xFF & (color1);
      var color2 = palettes[palid][pixel >> 4 & 0xF];//(textureBuffer[j] >> 4 & 0xF) + i];
      var red2 = 0xFF & (color2 >> 16);
      var green2 = 0xFF & (color2 >> 8);
      var blue2 = 0xFF & (color2);

      outputBuffer.push(red1, green1, blue1, red2, green2, blue2);
    }
    fs.writeFileSync(`export/texel_${texoffset / textureSize}_palette_${palid}.raw`, Buffer.from(outputBuffer));
    i++;
    outputBuffer = [];
  }
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

  for (let i = 0; i < texturesCount; i++) {
    const texeloffset = buffer.readUInt32LE(offset);// / 4096;
    offset += 4;
    const palid = buffer.readUInt32LE(offset) / 16;
    offset += 4;
    dict.push([texeloffset, palid]);
  }
  return dict;
}


main(process.argv)