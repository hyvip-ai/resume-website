import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let planet, planetSkeleton, particle;

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.set(0, 0, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(sizes.width, sizes.height);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const controls = new OrbitControls(camera, renderer.domElement);

function addPlanet() {
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(200, 200, 200);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);

  const canvasTexture = new THREE.CanvasTexture(new FlakesTexture());
  canvasTexture.wrapS = THREE.RepeatWrapping;
  canvasTexture.wrapT = THREE.RepeatWrapping;
  canvasTexture.repeat.x = 10;
  canvasTexture.repeat.y = 6;

  const sphereGeometry = new THREE.SphereGeometry(80);
  const sphereMaterialControl = {
    color: 0x000,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness: 0.9,
    roughness: 0.5,
    color: 0x8418ca,
    normalMap: canvasTexture,
    normalScale: new THREE.Vector2(0.1, 0.1),
    side: THREE.DoubleSide,
  };
  const sphereMaterial = new THREE.MeshPhysicalMaterial(sphereMaterialControl);
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, 0, 0);
  const sphereCoverGeometry = new THREE.IcosahedronGeometry(100, 1);
  var sphereCoverMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  const sphereCoverMesh = new THREE.Mesh(
    sphereCoverGeometry,
    sphereCoverMaterial
  );

  const lights = [];
  lights[0] = new THREE.DirectionalLight(0xffffff, 1);
  lights[0].position.set(1, 0, 0);
  lights[1] = new THREE.DirectionalLight(0x11e8bb, 1);
  lights[1].position.set(0.75, 1, 0.5);
  lights[2] = new THREE.DirectionalLight(0x8200c9, 1);
  lights[2].position.set(-0.75, -1, 0.5);

  particle = new THREE.Object3D();
  const particleGeometry = new THREE.SphereGeometry(0.3);
  const particleMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading,
  });
  for (var i = 0; i < 2500; i++) {
    var particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
    particleMesh.position
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize();
    particleMesh.position.multiplyScalar(90 + Math.random() * 700);
    particleMesh.rotation.set(
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2
    );
    particle.add(particleMesh);
  }

  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);
  scene.add(pointLightHelper);
  scene.add(sphereMesh);
  scene.add(sphereCoverMesh);
  scene.add(pointLight);
  scene.add(particle);

  planet = sphereMesh;
  planetSkeleton = sphereCoverMesh;
  render();
}

// Define the render loop
function render() {
  requestAnimationFrame(render);
  controls.update();
  planet.rotation.x += 0.002;
  planet.rotation.y += 0.003;
  planetSkeleton.rotation.x -= 0.001;
  planetSkeleton.rotation.y -= 0.002;
  particle.rotation.x += 0.0;
  particle.rotation.y -= 0.0004;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

addPlanet();
