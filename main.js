const PALLETES = '../palettes.bin';
const WTEXELS = '../wtexels.bin';

function main(args) {
  const a = palette(PALLETES);

  console.log(a);

  const m = mappings('../mappings.bin');

  console.log(m);

  const b = walls2(WTEXELS, a, m);

  console.log(b);
}

const fs = require('fs');
const exec = require("child_process").execSync;


function palette(file) {
    var buffer = fs.readFileSync(file);
    var numColors = buffer.readInt32LE(0);
    paletteColors = [];

    for (var i = 4; i < numColors + 4; i += 2) {
        var tmp = buffer.readUInt16LE(i);
        var r = tmp & 0x1F;
        r = r << 3 | (r >> 2);
        var g = tmp >> 5 & 0x3F;
        g = g << 2 | (g >> 4);
        var b = tmp >> 11 & 0x1F;
        b = b << 3 | (b >> 2);
        var color = (0xFF000000 | r << 16 | g << 8 | b << 0);
        paletteColors.push(color);
    }
    return paletteColors;
}



// function walls(file, paletteColors, mappings) {
//     var texels = fs.readFileSync(file);
//     var textureBuffer = texels.slice(4);
//     var outputBuffer = [];
//     let i = 0;

//     for (var i = 0; i < paletteColors.length; i += 16) {
//         for (var j = 0; j < textureBuffer.length / 2048; j++) {
//           console.log(j, paletteColors[mappings[j]]);
//             var color1 = paletteColors[mappings[j]]; //(textureBuffer[j] & 0xF) + i];
//             var red1 = 0xFF & (color1 >> 16);
//             var blue1 = 0xFF & (color1);
//             var green1 = 0xFF & (color1 >> 8);
//             var color2 = paletteColors[mappings[j]];//(textureBuffer[j] >> 4 & 0xF) + i];
//             var red2 = 0xFF & (color1 >> 16);
//             var blue2 = 0xFF & (color1);
//             var green2 = 0xFF & (color1 >> 8);

//             outputBuffer.push(red1, green1, blue1, red2, green2, blue2);
//         }
//         fs.writeFileSync("export/texels" + i + ".raw", Buffer.from(outputBuffer));
//         i++;
//         outputBuffer = [];
//     }
//     return;
// }

function walls2(file, paletteColors, mappings) {
  var texels = fs.readFileSync(file);
  var textureBuffer = texels.slice(4);
  var outputBuffer = [];
  let i = 0;

  for (const texoffset_ in mappings) {
    const texoffset = Number(texoffset_);
    for (var j = texoffset; j < texoffset + 4096; j++) {
      const palid = mappings[texoffset];
      // console.log(j, texoffset, palid, paletteColors[(textureBuffer[j] & 0xF) + palid]);
        var color1 = paletteColors[(textureBuffer[j] & 0xF) + palid]; //(textureBuffer[j] & 0xF) + i];
        var red1 = 0xFF & (color1 >> 16);
        var blue1 = 0xFF & (color1);
        var green1 = 0xFF & (color1 >> 8);
        var color2 = paletteColors[(textureBuffer[j] >> 4 & 0xF) + palid];//(textureBuffer[j] >> 4 & 0xF) + i];
        var red2 = 0xFF & (color1 >> 16);
        var blue2 = 0xFF & (color1);
        var green2 = 0xFF & (color1 >> 8);

        outputBuffer.push(red1, green1, blue1, red2, green2, blue2);
    }
    fs.writeFileSync("export/texels" + i + ".raw", Buffer.from(outputBuffer));
    i++;
    outputBuffer = [];
  }
}

function mappings(file) {
  var buffer = fs.readFileSync(file);
  let offset = 0;
  var count1 = buffer.readInt32LE(offset);
  offset += 4;
  var count2 = buffer.readInt32LE(offset);
  offset += 4;
  var count3 = buffer.readInt32LE(offset);
  offset += 4;
  var count4 = buffer.readInt32LE(offset);
  offset += 4;

  const dict = {};

  for (let i = 0; i < count1; i++) {
    const texelid = buffer.readUInt32LE(offset);// / 4096;
    offset += 4;
    const palid = buffer.readUInt32LE(offset) / 16;
    offset += 4;
    dict[texelid] = palid;
  }
  return dict;
}


main(process.argv)