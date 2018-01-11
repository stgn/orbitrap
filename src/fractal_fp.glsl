#define M_PI 3.1415926535897932384626433832795

varying vec2 v_uv;

uniform float aspect_ratio;
uniform bool mandelbrot;
uniform vec2 julia_param;
uniform mat3 image_transform;
uniform sampler2D image;

vec4 sample_image(vec2 p) {
    if(p.x < 0.0 || p.y < 0.0 || p.x >= 1.0 || p.y >= 1.0)
        return vec4(0.0);
    return texture2D(image, p);
}

vec4 orbit_map(vec4 c, vec2 p) {
    vec4 s = sample_image((vec3(p, 1.0) * image_transform).xy + 0.5);
    return mix(c, s, s.a);
}

vec2 complex_square(vec2 v) {
    return vec2(
        v.x * v.x - v.y * v.y,
        v.x * v.y * 2.0
    );
}

void main() {
    vec4 res = vec4(vec3(0.0), 1.0);

    vec2 z = (v_uv - 0.5) * vec2(aspect_ratio, 1.0) * 3.0;
    vec2 c = mandelbrot ? z : julia_param;

    for(int i = 0; i < 4; i++) {
        z = complex_square(z) + c;
        res = orbit_map(res * 0.5, z);
    }

    gl_FragColor = res;
}
