import './index.css';

import {
  Matrix3,
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';

import dat from 'dat.gui/build/dat.gui.js';

import fractalVertexProgram from './fractal_vp.glsl';
import fractalFragmentProgram from './fractal_fp.glsl';

var renderer, scene, camera, uniforms;

var state = {
  mandelbrot: false,
  re: 0.5,
  im: 0.5,
  scale: 1.0,
  rotate: 0,

  selectImage() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.onchange = e => {
      var file = e.target.files[0];
      var url = URL.createObjectURL(file);
      // TODO: upsample non-pow2-sized images instead of downsampling
      this.image = new TextureLoader().load(url, () => update());
      URL.revokeObjectURL(url);
    };
    input.click();
  }
};

function init() {
  camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene = new Scene();

  uniforms = { 
    aspect_ratio: {},
    mandelbrot: {},
    julia_param: { type: 'v2' },
    image_transform: { type: 'm3' },
    image: { type: 't' }
  };

  var quad = new PlaneBufferGeometry(2, 2);
  var material = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: fractalVertexProgram,
    fragmentShader: fractalFragmentProgram
  });

  var mesh = new Mesh(quad, material);
  scene.add(mesh);

  renderer = new WebGLRenderer();
  window.onresize = resize;
  resize();

  document.body.appendChild(renderer.domElement);
}

function update() {
  uniforms.mandelbrot.value = state.mandelbrot;
  uniforms.julia_param.value = new Vector2(state.re, state.im);

  var m = new Matrix3(),
      cos = Math.cos(state.rotate / 180 * Math.PI),
      sin = Math.sin(state.rotate / 180 * Math.PI);
  m.set(cos, sin, 0, -sin, cos, 0, 0, 0, 1);
  m.multiplyScalar(1 / state.scale);
  uniforms.image_transform.value = m;

  uniforms.image.value = state.image;

  renderer.render(scene, camera);
}

function resize() {
  var w = window.innerWidth,
      h = window.innerHeight;
  renderer.setSize(w, h);
  uniforms.aspect_ratio.value = w / h;
  update();
}

window.onload = function() {
  var gui = new dat.GUI();

  gui.onChange = function(f) {
    var i, j;
    for (i in this.__controllers) 
      this.__controllers[i].onChange(f);
    for (i in this.__folders) 
      for (j in this.__folders[i].__controllers) 
        this.__folders[i].__controllers[j].onChange(f);
  };

  gui.add(state, 'selectImage');
  gui.add(state, 'mandelbrot');
  gui.add(state, 're', -1, 1, 0.01);
  gui.add(state, 'im', -1, 1, 0.01);
  gui.add(state, 'scale', 0.1, 10);
  gui.add(state, 'rotate', 0, 360);
  gui.onChange(update);

  init();
  update();
};
