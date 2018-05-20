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

#pragma glslify: export(hsl2rgb)
