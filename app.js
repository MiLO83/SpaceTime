import { observe } from './physics.js';
const $ = id => document.getElementById(id);
const year = new Date().getFullYear();
let mode = 'existing';
const format = n => n.toLocaleString('en-US', { maximumFractionDigits: 1, useGrouping: false });
function update() {
  const distance = +$('distance').value, speed = +$('speed').value / 100;
  const r = observe(mode, distance, speed, year);
  $('today').textContent = year;
  $('distance-value').textContent = `${distance.toLocaleString()} ly`;
  $('speed-value').textContent = `${speed.toFixed(2)}c`;
  $('speed-control').hidden = mode !== 'launch';
  $('mode-description').textContent = {
    existing: 'Imagine a telescope that already exists far from Earth and looks toward us today.',
    launch: 'Launch from Earth today, cruise to this distance, then stop and look back. Could you catch our old light?',
    mirror: 'Imagine an ideal mirror already in place, aligned to return Earth’s light. What could reach us today?'
  }[mode];
  $('seen-year').textContent = $('scene-year').textContent = format(r.seen);
  $('result-label').textContent = mode === 'mirror' ? 'THE RETURNING LIGHT SHOWS EARTH IN' : 'THE TELESCOPE SEES EARTH IN';
  $('scene-caption').textContent = mode === 'mirror' ? 'Earth year visible in the return today' : 'Earth year visible at the telescope';
  $('result-copy').textContent = mode === 'launch'
    ? `Arrival in ${format(r.arrival)}. You see Earth ${format(r.seen - year)} years after launch — never before it.`
    : mode === 'mirror' ? `A ${2 * distance}-year round trip. The mirror had to be there when the light reached it in ${format(year - distance)}.`
    : `${distance} years of light travel. A view of our past, available there today.`;
  $('emit-date').textContent = format(r.seen);
  $('observe-date').textContent = format(mode === 'mirror' ? year - distance : r.arrival);
  $('return-date').textContent = format(r.received);
  $('out-time').textContent = $('back-time').textContent = `${distance} yr`;
  $('middle-label').textContent = mode === 'mirror' ? '02 / MIRROR' : '02 / TELESCOPE';
  $('middle-copy').textContent = mode === 'mirror' ? 'Light reflects back' : 'Observation is made';
  $('return-copy').textContent = mode === 'mirror' ? 'Reflected light arrives today' : 'The image reaches Earth';
  $('verdict').textContent = mode === 'existing'
    ? `Possible in principle: an observer already there can see our past. But we on Earth would wait until ${format(r.received)} for an immediate reply sent today. A reply arriving here today would show Earth from ${format(year - 2 * distance)}.`
    : mode === 'launch' ? `The head start wins. At ${speed.toFixed(2)}c, the journey takes ${format(distance / speed)} Earth years. Subtract the ${distance}-year lookback and you still see Earth after launch. Travelling closer to light speed does not reverse that ordering.`
    : `A light echo can bring old information back. But the reflector must already intercept that light; building and sending one now cannot retrieve a past that has already passed it.`;
  $('aperture').textContent = Math.round(r.apertureKm).toLocaleString('en-US');
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  update();
}));
$('distance').addEventListener('input', update);
$('speed').addEventListener('input', update);
update();

// A self-contained WebGL fragment shader: procedural globe and outgoing light shells.
const canvas = $('universe');
const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
canvas.addEventListener('webglcontextlost', () => {
  canvas.hidden = true;
  $('fallback').hidden = false;
  $('play').hidden = true;
});
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
function syncPlay() { $('play').textContent = paused ? 'Play motion ▷' : 'Pause motion Ⅱ'; $('play').setAttribute('aria-pressed', String(paused)); }
syncPlay();
$('play').addEventListener('click', () => { paused = !paused; syncPlay(); });
function startScene() {
  const vertex = `attribute vec2 position; void main(){ gl_Position=vec4(position,0.,1.); }`;
  const fragment = `precision highp float;
  uniform vec2 resolution;
  uniform float time;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){return noise(p)*.5+noise(p*2.03)*.25+noise(p*4.07)*.125+noise(p*8.11)*.0625;}
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
    vec3 col=vec3(.011,.022,.038);
    vec2 cell=floor(gl_FragCoord.xy/3.);
    float star=step(.9975,hash(cell));
    col+=star*pow(hash(cell+3.),3.)*.65;
    vec2 p=uv-vec2(.02,.065);
    float r=length(p), radius=.224;
    col+=vec3(.025,.09,.12)*exp(-r*3.8);
    for(int i=0;i<5;i++){
      float ring=radius+mod(float(i)*.118+time*.012,.59);
      float line=exp(-abs(r-ring)*650.);
      col+=vec3(.22,.56,.50)*line*.28*(1.-smoothstep(.25,.85,ring));
    }
    float glow=exp(-abs(r-radius)*95.);
    col+=vec3(.08,.34,.57)*glow*.6;
    if(r<radius){
      vec2 q=p/radius;
      vec3 n=vec3(q,sqrt(max(0.,1.-dot(q,q))));
      float lon=atan(n.x,n.z)+time*.017;
      float lat=asin(n.y);
      vec2 map=vec2(lon*2.2,lat*3.1);
      float land=fbm(map+vec2(4.2,3.7));
      float coast=smoothstep(.485,.52,land);
      vec3 sea=mix(vec3(.015,.10,.20),vec3(.035,.24,.36),fbm(map*3.));
      vec3 ground=mix(vec3(.055,.20,.15),vec3(.35,.40,.24),fbm(map*5.));
      vec3 surface=mix(sea,ground,coast);
      float ice=smoothstep(1.24,1.50,abs(lat)+noise(map*8.)*.13);
      surface=mix(surface,vec3(.7,.82,.83),ice);
      float cloud=smoothstep(.57,.72,fbm(map*2.+vec2(time*.009,0.)));
      surface=mix(surface,vec3(.8,.88,.92),cloud*.86);
      float light=max(dot(n,normalize(vec3(-.8,.5,1.))),0.);
      surface*=.08+.92*light;
      float fresnel=pow(1.-n.z,3.);
      col=surface+vec3(.12,.43,.65)*fresnel*(.12+light*.7);
    }
    col*=1.-.25*smoothstep(.35,.95,length(uv));
    gl_FragColor=vec4(col,1.);
  }`;
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const size = gl.getUniformLocation(program,'resolution'), clock = gl.getUniformLocation(program,'time');
  let time = 0, last = 0;
  function draw(now) {
    if (!paused && !document.hidden) time += Math.min((now-last)/1000,.05);
    last=now;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * scale), h = Math.round(canvas.clientHeight * scale);
    if(canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h); }
    gl.uniform2f(size,w,h); gl.uniform1f(clock,time); gl.drawArrays(gl.TRIANGLES,0,6);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
try { if (!gl) throw new Error('WebGL unavailable'); startScene(); }
catch (error) { $('fallback').hidden=false; $('play').hidden=true; console.warn(error.message); }
