#!/bin/bash
rm -rf raw png tiles
mkdir raw
mv export/*.raw raw/
find raw/ -name \*.raw -exec convert -size 64x64 -depth 8 rgb:{} -rotate 90 -flop {}.png \;
mkdir png
mv raw/*.png png/