#include <iostream>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

#include <stdio.h>

int main() {
    FILE *f = fopen("wtexels.bin", "rb");

    uint32_t wtex_size;
    fread(&wtex_size, sizeof(wtex_size), 1, f);

    auto **texture_datas = new unsigned char*[wtex_size / 2048];

    for(int i = 0; i < wtex_size / 2048; i++) {
        auto *texture_data = new unsigned char[2048];
        fread(texture_data, 2048, 1, f);
        texture_datas[i] = texture_data;
    }

    fclose(f);


    FILE *fp = fopen("palettes.bin", "rb");
    uint32_t pals_size;
    fread(&pals_size, sizeof(pals_size), 1, fp);

    auto *pal_data = new uint8_t[pals_size / 2 * 3];
    for(int i = 0; i < pals_size / 2; i++) {
        uint16_t color;
        fread(&color, sizeof(color), 1, fp);
        uint8_t red   = color & 0x1F;
        uint8_t green = (color >> 5 ) & 0x3F;
        uint8_t blue  = (color >> 11) & 0x1F;

        // convert to RGB888
        red   =   (red << 3) | (red >> 2);
        green = (green << 2) | (green >> 4);
        blue  =  (blue << 3) | (blue >> 2);

        pal_data[i * 3] = red;
        pal_data[i * 3 + 1] = green;
        pal_data[i * 3 + 2] = blue;
    }

    fclose(fp);

    FILE *fm = fopen("mappings.bin", "rb");
    uint32_t dummy, pal_map_count;
    fread(&pal_map_count, sizeof(pal_map_count), 1, fm);
    fread(&dummy, sizeof(dummy), 1, fm);
    fread(&dummy, sizeof(dummy), 1, fm);
    fread(&dummy, sizeof(dummy), 1, fm);

    for(int i = 0; i < pal_map_count; i++) {
        uint32_t tex, pal;
        fread(&tex, sizeof(tex), 1, fm);
        fread(&pal, sizeof(pal), 1, fm);
        tex /= 4096;

        unsigned char ctexture_data[64 * 64 * 3];
        for(int j = 0; j < 64 * 64 * 3; j += 6) {
            ctexture_data[j]     = pal_data[((texture_datas[tex][j / 6] & 0x0F) >> 0) * 3 + 0 + pal * 3];
            ctexture_data[j + 1] = pal_data[((texture_datas[tex][j / 6] & 0x0F) >> 0) * 3 + 1 + pal * 3];
            ctexture_data[j + 2] = pal_data[((texture_datas[tex][j / 6] & 0x0F) >> 0) * 3 + 2 + pal * 3];
            ctexture_data[j + 3] = pal_data[((texture_datas[tex][j / 6] & 0xF0) >> 4) * 3 + 0 + pal * 3];
            ctexture_data[j + 4] = pal_data[((texture_datas[tex][j / 6] & 0xF0) >> 4) * 3 + 1 + pal * 3];
            ctexture_data[j + 5] = pal_data[((texture_datas[tex][j / 6] & 0xF0) >> 4) * 3 + 2 + pal * 3];
        }

        char filename[PATH_MAX];

        snprintf(filename, PATH_MAX, "test_out/%d.png", i);

        stbi_write_png(filename, 64, 64, 3, ctexture_data, 64 * 3);

    }

    fclose(fm);


    return 0;
}
