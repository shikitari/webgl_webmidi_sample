
vec3 rgb2hsl(vec3 color) {
    float cmax = max(max(color.x, color.y), color.z);
    float cmin = min(min(color.x, color.y), color.z);
    float delta = cmax - cmin;

    float lightness = (cmax + cmin) / 2.0;
    float saturation;
    float hue;

    if (delta == 0.0) {
        saturation = 0.0;
    } else {
        saturation = delta / (1.0 - abs(2.0 * lightness - 1.0));
    }

    if (delta == 0.0) {
        hue = 0.0;
    } else if (cmax == color.x) {
        hue = 60.0 * mod(((color.y - color.z) / delta), 6.0);
    } else if (cmax == color.y) {
        hue = 60.0 * ((color.z - color.x) / delta + 2.0);
    } else if (cmax == color.z) {
        hue = 60.0 * ((color.x - color.y) / delta + 4.0);
    }
    if (hue < 0.0) {
        hue += 360.0;
    }
    if (hue > 360.0) {
        hue -= 360.0;
    }

    vec3 hsl;
    hsl.x = hue / 360.0;
    hsl.y = saturation;
    hsl.z = lightness;

    return hsl;
}

#pragma glslify: export(rgb2hsl)
