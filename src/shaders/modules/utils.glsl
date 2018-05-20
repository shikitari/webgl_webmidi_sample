float normalize0to1(float t) {
    return clamp(t, -1.0, 1.0) * 0.5 + 0.5;
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

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

vec3 hsl2rgb(vec3 hsl) {
    hsl.x *= 360.0;
    float c = (1.0 - abs(2.0 * hsl.z - 1.0)) * hsl.y;
    float heuDiv60 = hsl.x / 60.0;
    float x = c * (1.0 - abs(mod(heuDiv60, 2.0) - 1.0));
    float m = hsl.z - c / 2.0;

    vec3 rgb;
    if (hsl.x >= 0.0 && hsl.x < 60.0) {
        rgb.x = c;
        rgb.y = x;
        rgb.z = 0.0;
    } else if (hsl.x < 120.0) {
        rgb.x = x;
        rgb.y = c;
        rgb.z = 0.0;
    } else if (hsl.x < 180.0) {
        rgb.x = 0.0;
        rgb.y = c;
        rgb.z = x;
    } else if (hsl.x < 240.0) {
        rgb.x = 0.0;
        rgb.y = x;
        rgb.z = c;
    } else if (hsl.x < 300.0) {
        rgb.x = x;
        rgb.y = 0.0;
        rgb.z = c;
    } else if (hsl.x < 360.0) {
        rgb.x = c;
        rgb.y = 0.0;
        rgb.z = x;
    }
    rgb.x += m;
    rgb.y += m;
    rgb.z += m;
    return rgb;
}


#pragma glslify: export(normalize0to1)
#pragma glslify: export(rand)
#pragma glslify: export(rgb2hsl)
#pragma glslify: export(hsl2rgb)
