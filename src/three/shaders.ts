// Shared GLSL snippets for the planet.
// Classic simplex + fbm noise (Ashima) — used for stone displacement,
// moss coverage, wind-driven micro-motion, and crack emission.

export const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Ridged noise for crack veins
float ridge(vec3 p){
  return 1.0 - abs(snoise(p));
}
float ridgedMF(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<4;i++){
    v += a * pow(ridge(p), 2.0);
    p *= 2.1;
    a *= 0.55;
  }
  return v;
}
`;

export const planetVertex = /* glsl */ `
uniform float uTime;
uniform float uDisplace;
uniform float uWind;
varying vec3 vNormalW;
varying vec3 vPosO;
varying vec3 vPosW;
varying float vHeight;
varying float vMoss;
varying float vCrack;

${noiseGLSL}

void main(){
  vec3 pos = position;
  vPosO = pos;

  // Base rocky displacement — layered fbm gives craggy silhouette.
  float base = fbm(pos * 1.4);
  float rocks = fbm(pos * 3.2 + 12.3) * 0.6;
  float micro = fbm(pos * 9.0) * 0.15;
  float height = base + rocks + micro;

  // Moss mask: high where fbm is soft & tops face upward.
  float upness = clamp(dot(normalize(pos), vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5, 0.0, 1.0);
  float mossMask = smoothstep(0.05, 0.55, fbm(pos * 2.1 + 4.7)) * mix(0.4, 1.0, upness);

  // Wind: subtle vertex breathing on mossy zones.
  float wind = snoise(pos * 3.0 + vec3(uTime * 0.35)) * uWind * mossMask;

  vec3 displaced = pos + normal * (height * uDisplace * 0.18 + wind * 0.02);

  // Crack field: ridged noise carves narrow valleys.
  float crackField = ridgedMF(pos * 2.2 + vec3(9.1));
  float crack = smoothstep(0.75, 0.98, crackField);
  displaced -= normal * crack * 0.05;

  vHeight = height;
  vMoss = mossMask * (1.0 - crack);
  vCrack = crack;
  vNormalW = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vPosW = (modelMatrix * vec4(displaced, 1.0)).xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const planetFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uCrackGlow;
uniform vec3 uLightDir;
varying vec3 vNormalW;
varying vec3 vPosO;
varying vec3 vPosW;
varying float vHeight;
varying float vMoss;
varying float vCrack;

${noiseGLSL}

// Palette (matches brief: stone #8B8B84, moss #6F7F4A, flowers #C6B4E6)
const vec3 STONE_DARK = vec3(0.20, 0.22, 0.21);
const vec3 STONE_LIGHT = vec3(0.545, 0.545, 0.518);
const vec3 MOSS_DARK  = vec3(0.18, 0.24, 0.10);
const vec3 MOSS_LIGHT = vec3(0.436, 0.500, 0.290);
const vec3 FLOWER     = vec3(0.776, 0.706, 0.902);
const vec3 CRACK_GLOW = vec3(1.0, 0.98, 0.85);

void main(){
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(uLightDir);
  float ndl = clamp(dot(N, L), 0.0, 1.0);
  float rim = pow(1.0 - clamp(dot(N, vec3(0.0,0.0,1.0)), 0.0, 1.0), 2.5);

  // Stone base with high-frequency detail.
  float stoneNoise = fbm(vPosO * 8.0);
  vec3 stone = mix(STONE_DARK, STONE_LIGHT, smoothstep(-0.5, 0.9, stoneNoise + vHeight));

  // Moss layered noise + tiny flowers (very sparse).
  float mossN = fbm(vPosO * 14.0 + uTime * 0.02);
  vec3 moss = mix(MOSS_DARK, MOSS_LIGHT, smoothstep(-0.3, 0.9, mossN));
  float flowerMask = smoothstep(0.92, 0.98, fbm(vPosO * 22.0 + 3.1)) * vMoss;
  moss = mix(moss, FLOWER, flowerMask * 0.85);

  vec3 surface = mix(stone, moss, smoothstep(0.15, 0.55, vMoss));

  // Ambient occlusion in crevices.
  float ao = mix(0.55, 1.0, smoothstep(-0.3, 0.6, vHeight));

  // Cracks emit faint white light, ramped by uCrackGlow.
  float crackEdge = smoothstep(0.35, 0.9, vCrack);
  vec3 emissive = CRACK_GLOW * crackEdge * uCrackGlow * 1.6;

  // Lighting composition — soft key + ambient wrap.
  vec3 lit = surface * (ndl * 0.75 + 0.35) * ao;
  lit += surface * rim * 0.12;
  lit += emissive;

  // Deepen darks for cinematic feel.
  lit = pow(lit, vec3(1.05));

  gl_FragColor = vec4(lit, 1.0);
}
`;
