import { defineProperties } from "figma:shaders"

export default function Effect() {}

export function setup(device, frame) {
  frame.state.module = device.createShaderModule({ code: `diagnostic(off,derivative_uniformity);
struct Uniforms { view: vec4f, finish: vec4f, tint: vec4f };
@group(0) @binding(0) var<uniform> u: Uniforms;
struct VertexOut { @builtin(position) position: vec4f, @location(0) uv: vec2f };
@vertex fn vs_main(@builtin(vertex_index) index: u32) -> VertexOut {
  let positions = array(vec2f(-1.,-1.), vec2f(3.,-1.), vec2f(-1.,3.));
  var out: VertexOut;
  out.position = vec4f(positions[index],0.,1.);
  out.uv = positions[index] * vec2f(.5,-.5) + .5;
  return out;
}
fn rot(a: f32) -> mat2x2f { return mat2x2f(cos(a),sin(a),-sin(a),cos(a)); }
fn roundedBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  let q = abs(p) - b + r;
  return length(max(q, vec2f(0.))) + min(max(q.x,q.y),0.) - r;
}
fn smin(a: f32,b: f32,k: f32) -> f32 {
  let h = max(k-abs(a-b),0.)/k;
  return min(a,b)-h*h*k*.25;
}
fn field(world: vec3f) -> f32 {
  let yaw = rot(u.view.z);
  let tilt = rot(-.22);
  let xz = yaw * world.xz;
  let yz = tilt * vec2f(world.y,xz.y);
  let p = vec3f(xz.x,yz.x,yz.y);
  // A continuous ribbon: front-facing loop curls away along its right edge.
  let curl = .30*sin(2.6*p.x + .6) + .13*sin(3.2*p.y);
  let outer = roundedBox(p.xy-vec2f(.04,.28), vec2f(.73,.65), .50);
  let inner = roundedBox(p.xy-vec2f(.04,.28), vec2f(.37,.30), .25);
  let ribbon = max(outer,-inner);
  let stem = roundedBox(p.xy-vec2f(-.51,-.51),vec2f(.18,.59),.13);
  let outline = smin(ribbon,stem,.10);
  let q = vec2f(outline+.048, abs(p.z-curl)-.105);
  return min(max(q.x,q.y),0.)+length(max(q,vec2f(0.)))-.048;
}
fn normalAt(p: vec3f) -> vec3f {
  let e = .0015;
  return normalize(vec3f(field(p+vec3f(e,0.,0.))-field(p-vec3f(e,0.,0.)),field(p+vec3f(0.,e,0.))-field(p-vec3f(0.,e,0.)),field(p+vec3f(0.,0.,e))-field(p-vec3f(0.,0.,e))));
}
fn occlusion(p: vec3f,n: vec3f) -> f32 {
  var occ = 0.;
  var strength = 1.;
  for(var i=1;i<5;i=i+1) {
    let d = .035*f32(i);
    occ += (d-field(p+n*d))*strength;
    strength *= .58;
  }
  return clamp(1.-3.5*occ,.35,1.);
}
fn shade(uv: vec2f) -> vec4f {
  let xy = (uv-vec2f(.5,.50))*vec2f(u.view.x/u.view.y,1.)*3.25/u.view.w;
  let origin = vec3f(xy.x,-xy.y,4.);
  let ray = vec3f(0.,0.,-1.);
  var travel = 0.;
  var hit = false;
  for(var i=0;i<100;i=i+1) {
    let d = field(origin+ray*travel);
    if(d<.0008) { hit=true; break; }
    travel += max(d*.72,.0005);
    if(travel>6.) { break; }
  }
  if(!hit) { return vec4f(0.); }
  let p = origin+ray*travel;
  let n = normalAt(p);
  let v = -ray;
  let key = normalize(vec3f(-.7,1.,1.8));
  let fillLight = normalize(vec3f(1.,-.1,1.));
  let halfVector = normalize(key+v);
  let fresnel = pow(1.-max(dot(n,v),0.),4.);
  let diffuse = max(dot(n,key),0.);
  let roughness = u.finish.x;
  let specular = pow(max(dot(n,halfVector),0.),mix(150.,18.,roughness));
  // Broad reflected studio cards make the curvature readable, without neon glow.
  let reflected = reflect(-v,n);
  let cardA = pow(max(dot(reflected,normalize(vec3f(-.6,.9,1.4))),0.),14.);
  let cardB = pow(max(dot(reflected,normalize(vec3f(.8,.2,1.))),0.),32.);
  let blue = u.tint.rgb;
  let pearl = vec3f(.86,.91,1.);
  let base = mix(blue,pearl,clamp(.22+.32*p.y+.16*n.x,0.,.65));
  let ao = occlusion(p,n);
  var color = base*(.25+.67*diffuse+.18*max(dot(n,fillLight),0.))*ao;
  color += vec3f(1.,.98,.95)*(specular*.45+cardA*.37+cardB*.2);
  color += mix(vec3f(.3,.44,.9),vec3f(.84,.88,1.),u.finish.y)*fresnel*.38;
  color = mix(color,vec3f(dot(color,vec3f(.2126,.7152,.0722))),u.finish.y);
  color = pow(clamp(color,vec3f(0.),vec3f(1.)),vec3f(.82));
  return vec4f(color,u.tint.a);
}
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // Four subpixels keep the silhouette clean when used as a small icon.
  let e = vec2f(.25/u.view.x,.25/u.view.y);
  let a = shade(uv+e);
  let b = shade(uv-e);
  let c = shade(uv+vec2f(e.x,-e.y));
  let d = shade(uv+vec2f(-e.x,e.y));
  let alpha = (a.a+b.a+c.a+d.a)*.25;
  let premul = (a.rgb*a.a+b.rgb*b.a+c.rgb*c.a+d.rgb*d.a)*.25;
  return vec4f(premul/max(alpha,.0001),alpha);
}
` });
  frame.state.uniforms = device.createBuffer({size:48,usage:GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST});
  frame.state.pipeline = null;
  frame.state.pipelineFormat = null;
}
export function render(device, frame) {
  var p = frame.params || {};
  var c = p.tint || {r:.10,g:.28,b:.82,a:1};
  device.queue.writeBuffer(frame.state.uniforms,0,new Float32Array([
    frame.output.width,frame.output.height,Number(p.rotation ?? -15)*Math.PI/180,Number(p.scale ?? 1),
    Number(p.roughness ?? .28),Number(p.silver ?? 0),0,0,
    Number(c.r),Number(c.g),Number(c.b),Number(c.a ?? 1)
  ]));
  if(frame.state.pipelineFormat !== frame.output.format) {
    frame.state.pipeline = device.createRenderPipeline({layout:'auto',vertex:{module:frame.state.module,entryPoint:'vs_main'},fragment:{module:frame.state.module,entryPoint:'fs_main',targets:[{format:frame.output.format}]},primitive:{topology:'triangle-list'}});
    frame.state.pipelineFormat = frame.output.format;
  }
  var encoder = device.createCommandEncoder();
  var pass = encoder.beginRenderPass({colorAttachments:[{view:frame.output.createView(),loadOp:'clear',clearValue:{r:0,g:0,b:0,a:0},storeOp:'store'}]});
  pass.setPipeline(frame.state.pipeline);
  pass.setBindGroup(0,device.createBindGroup({layout:frame.state.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:frame.state.uniforms}}]}));
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
}
defineProperties(Effect,{
  tint:{type:'color',label:'Ceramic color',defaultValue:{r:.10,g:.28,b:.82,a:1}},
  rotation:{type:'number',label:'View angle',control:'slider',min:-45,max:45,step:1,defaultValue:-15},
  roughness:{type:'number',label:'Roughness',control:'slider',min:.05,max:.85,step:.01,defaultValue:.28},
  silver:{type:'number',label:'Silver finish',control:'slider',min:0,max:1,step:.01,defaultValue:0},
  scale:{type:'number',label:'Scale',control:'slider',min:.5,max:1.3,step:.01,defaultValue:1}
});
