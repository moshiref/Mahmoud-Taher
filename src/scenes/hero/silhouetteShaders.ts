/**
 * Shaders for the portrait plane and the effects derived from its alpha
 * channel. The photograph itself is drawn unlit with no colour changes —
 * only revealed by a mask. The rim light is a separate layer built from
 * the cut-out's silhouette, so the original pixels are never filtered.
 */

export const silhouetteVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * The portrait: exact texture colours, wiped in from the bottom with a accent
 * scan line. The photo's straight crop edge dissolves into the black over its
 * lowest 10% (a compositing fade at the frame edge, not a change to the image).
 */
export const portraitFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform vec3 uLine;
  varying vec2 vUv;

  void main() {
    vec4 c = texture2D(uMap, vUv);
    float edge = uReveal * 1.08 - 0.04;
    float shown = step(vUv.y, edge);
    // A solid scan line rides the wipe edge while the reveal is running.
    float line = (1.0 - step(0.0045, abs(vUv.y - edge))) * step(0.5, c.a) * (1.0 - step(0.999, uReveal));
    float alpha = max(c.a * shown, line) * smoothstep(0.0, 0.1, vUv.y);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(mix(c.rgb, uLine, line), alpha);
    #include <colorspace_fragment>
  }
`

/** Blurred alpha of the cut-out, sampled on two rings of 8 taps. */
const blurredAlpha = /* glsl */ `
  float blurredAlpha(sampler2D map, vec2 uv, vec2 radius) {
    float sum = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.7853982;
      vec2 dir = vec2(cos(a), sin(a));
      sum += texture2D(map, uv + dir * radius).a;
      sum += texture2D(map, uv + dir * radius * 0.5).a;
    }
    return sum / 16.0;
  }
`

/**
 * Soft white backlight outside the silhouette's edge, fading out below the
 * shoulders — like a light behind and above the subject, not an outline.
 */
export const rimFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uStrength;
  uniform float uReveal;
  uniform vec2 uRadius;
  varying vec2 vUv;
  ${blurredAlpha}

  void main() {
    float spread = blurredAlpha(uMap, vUv, uRadius);
    float inside = texture2D(uMap, vUv).a;
    float rim = clamp(spread - inside, 0.0, 1.0) * step(vUv.y, uReveal * 1.08 - 0.04);
    rim *= smoothstep(0.42, 0.82, vUv.y);
    float alpha = rim * uStrength;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vec3(1.0), alpha);
    #include <colorspace_fragment>
  }
`
