export const planetVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDisp;

  // hash / noise
  vec3 hash3(vec3 p){
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
  }
  float snoise(vec3 p){
    vec3 i = floor(p); vec3 f = fract(p);
    vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3(i+vec3(0,0,0)), f-vec3(0,0,0)),
                       dot(hash3(i+vec3(1,0,0)), f-vec3(1,0,0)), u.x),
                   mix(dot(hash3(i+vec3(0,1,0)), f-vec3(0,1,0)),
                       dot(hash3(i+vec3(1,1,0)), f-vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)), f-vec3(0,0,1)),
                       dot(hash3(i+vec3(1,0,1)), f-vec3(1,0,1)), u.x),
                   mix(dot(hash3(i+vec3(0,1,1)), f-vec3(0,1,1)),
                       dot(hash3(i+vec3(1,1,1)), f-vec3(1,1,1)), u.x), u.y), u.z);
  }
  float fbm(vec3 p){
    float v = 0.0; float a = 0.5;
    for(int i=0;i<5;i++){ v += a*snoise(p); p*=2.03; a*=0.5; }
    return v;
  }

  void main(){
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float n = fbm(p*1.8 + uTime*0.03);
    float ridged = 1.0 - abs(fbm(p*3.2));
    float disp = n*0.08 + ridged*0.05;
    disp += uScroll*0.04*sin(p.y*6.0 + uTime*0.6);
    vDisp = disp;
    vec3 displaced = p + normal * disp;
    vPos = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced,1.0);
  }
`;

export const planetFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vDisp;

  vec3 hash3(vec3 p){
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
  }
  float snoise(vec3 p){
    vec3 i = floor(p); vec3 f = fract(p);
    vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3(i+vec3(0,0,0)), f-vec3(0,0,0)),
                       dot(hash3(i+vec3(1,0,0)), f-vec3(1,0,0)), u.x),
                   mix(dot(hash3(i+vec3(0,1,0)), f-vec3(0,1,0)),
                       dot(hash3(i+vec3(1,1,0)), f-vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)), f-vec3(0,0,1)),
                       dot(hash3(i+vec3(1,0,1)), f-vec3(1,0,1)), u.x),
                   mix(dot(hash3(i+vec3(0,1,1)), f-vec3(0,1,1)),
                       dot(hash3(i+vec3(1,1,1)), f-vec3(1,1,1)), u.x), u.y), u.z);
  }
  float fbm(vec3 p){
    float v=0.0; float a=0.5;
    for(int i=0;i<5;i++){ v+=a*snoise(p); p*=2.03; a*=0.5; }
    return v;
  }

  void main(){
    vec3 L = normalize(vec3(0.7, 0.6, 0.8));
    float diff = clamp(dot(normalize(vNormal), L), 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(normalize(vNormal), vec3(0,0,1)),0.0,1.0), 2.5);

    float moss = smoothstep(0.02, 0.18, fbm(vPos*2.2));
    vec3 stone = mix(vec3(0.09,0.09,0.10), vec3(0.22,0.22,0.24), fbm(vPos*4.0)*0.5+0.5);
    vec3 mossCol = mix(vec3(0.05,0.28,0.14), vec3(0.10,0.55,0.28), fbm(vPos*5.0)*0.5+0.5);
    vec3 base = mix(stone, mossCol, moss*0.75);

    // cracks
    float crack = smoothstep(0.55, 0.62, 1.0 - abs(fbm(vPos*3.0)));
    vec3 glow = vec3(0.0, 0.9, 0.46) * crack * (0.4 + uScroll*1.6);

    vec3 color = base * (0.25 + diff*0.9) + glow + rim*vec3(0.0,0.6,0.35)*0.5;
    color = pow(color, vec3(0.95));
    gl_FragColor = vec4(color, 1.0);
  }
`;
