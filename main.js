import { Linear, gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as THREE from 'three';

const additionalRotation = 72;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

let planet,
  planetSkeleton,
  particle,
  planes = [],
  cloud,
  p1,
  p2,
  tube,
  path,
  wireframe,
  atTunnel = false,
  torusAdded = false,
  tunnelDone = false;

let points = [
  [10, 89, 0],
  [50, 88, 10],
  [76, 139, 20],
  [126, 141, 12],
  [150, 112, 8],
  [157, 73, 0],
  [180, 44, 5],
  [207, 35, 10],
  [232, 36, 0],
];

//Convert the array of points into vertices
for (let i = 0; i < points.length; i++) {
  let x = points[i][0];
  let y = points[i][2];
  let z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}
//Create a path from the points
path = new THREE.CatmullRomCurve3(points);
path.tension = 0.5;

let cameraTargetPercentage = 0;
let currentCameraPercentage = 0;

let tubePerc = {
  percent: 0,
};

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  1,
  1000
);
camera.position.y = 150;
camera.position.z = 150;

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setSize(sizes.width, sizes.height);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// new OrbitControls(camera, renderer.domElement);
function addPlanet() {
  const pointLight1 = new THREE.PointLight(0xa1251b, 1);
  pointLight1.position.set(200, 200, 200);

  const pointLight2 = new THREE.PointLight(0xa1251b, 1);
  pointLight2.position.set(-200, 200, 200);

  const depthTexture = new THREE.TextureLoader().load('/texture/depth2.jpg');
  depthTexture.wrapS = THREE.RepeatWrapping;
  depthTexture.wrapT = THREE.RepeatWrapping;

  const sphereGeometry = new THREE.SphereGeometry(130);

  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x9c2e35,
    normalMap: depthTexture,
    normalScale: new THREE.Vector2(0.2, 0.2),
    side: THREE.DoubleSide,
  });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, 0, 0);
  const sphereCoverGeometry = new THREE.IcosahedronGeometry(170, 1);
  var sphereCoverMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  const sphereCoverMesh = new THREE.Mesh(
    sphereCoverGeometry,
    sphereCoverMaterial
  );

  const cloudGeometry = new THREE.SphereGeometry(133);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('/texture/earthCloud.png'),
    transparent: true,
    color: 0xffffff,
  });
  const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
  cloudMesh.rotation.set(205, 120, 0);
  sphereMesh.rotation.set(205, 120, 0);

  const lights = [];
  lights[0] = new THREE.DirectionalLight(0x9c2e35, 0.1);
  lights[0].position.set(1, 0, 0);
  lights[1] = new THREE.DirectionalLight(0x9c2e35, 0.3);
  lights[1].position.set(-0.75, -1, 0.5);
  lights[2] = new THREE.DirectionalLight('#ffffff', 0.1);
  lights[2].position.set(-0.35, 1, -2);

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
  scene.add(sphereMesh);
  scene.add(cloudMesh);
  scene.add(sphereCoverMesh);
  scene.add(pointLight1);
  scene.add(pointLight2);
  scene.add(particle);

  planet = sphereMesh;
  planetSkeleton = sphereCoverMesh;
  cloud = cloudMesh;
}

function addTunnel() {
  let geometry = new THREE.TubeGeometry(path, 300, 10, 35, false);

  let texture = new THREE.TextureLoader().load(
    '/texture/3d_space.jpg',
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(15, 2);
    }
  );

  let material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    normalMap: texture,
    shininess: 20,
    specular: 0x0b2349,
    color: 0x9d00ff,
  });

  //Create a mesh
  tube = new THREE.Mesh(geometry, material);
  tube.traverse((child) => {
    child.visible = false;
  });
  scene.add(tube);

  const wireFrameGro = new THREE.TubeGeometry(path, 60, 8, 32, false);
  const geo = new THREE.EdgesGeometry(wireFrameGro);

  const mat = new THREE.LineBasicMaterial({
    linewidth: 2,
    opacity: 0.2,
    transparent: 1,
  });

  wireframe = new THREE.LineSegments(geo, mat);
  wireframe.traverse((child) => {
    child.visible = false;
  });
  scene.add(wireframe);
}

// tunnel
function updateCameraPercentage(percentage) {
  p1 = path.getPointAt(percentage % 1);
  p2 = path.getPointAt((percentage + 0.03) % 3);
  camera.position.set(p1.x, p1.y, p1.z);
  camera.lookAt(p2);
}

function addDiscoTorus() {
  // Disco

  const numCuboids = 10;
  const circleRadius = 45;

  const cuboidWidth = getRandomInt(10, 15);
  const cuboidHeight = 1;
  const cuboidDepth = getRandomInt(4, 6);
  for (let i = 0; i < numCuboids; i++) {
    let position = new THREE.Vector3();

    const angle = Math.random() * 2 * Math.PI; // choose a random angle
    position.set(
      circleRadius * Math.cos(angle),
      0,
      circleRadius * Math.sin(angle)
    ); // calculate the position on the circle

    const cuboidGeometry = new THREE.BoxGeometry(
      cuboidWidth,
      cuboidHeight,
      cuboidDepth
    );

    const reflectiveMaterial = new THREE.MeshPhongMaterial({
      reflectivity: 1,
      refractionRatio: 0,
      fog: true,
    });
    const cuboid = new THREE.Mesh(cuboidGeometry, reflectiveMaterial);
    cuboid.position.copy(position);
    cuboid.position.y += getRandomInt(-6, 6);
    planes.push(cuboid);
    scene.add(cuboid);
  }
}

function changeDiscoTorusPosition() {
  planes.forEach((cuboid) => {
    cuboid.position.x += 550;
    cuboid.position.z += 60;
    cuboid.position.y -= 180;
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Define the render loop

addPlanet();

addTunnel();

function addDisco() {
  for (let i = -8; i <= 0; i += 1) {
    addDiscoTorus();
  }

  changeDiscoTorusPosition();
}

function render() {
  requestAnimationFrame(render);
  planet.rotation.x += 0.002;
  planet.rotation.y += 0.003;
  planet.material.needsUpdate = true;
  cloud.rotation.x += 0.002;
  cloud.rotation.y += 0.003;
  planetSkeleton.rotation.x -= 0.001;
  planetSkeleton.rotation.y -= 0.002;
  particle.rotation.x += 0.0;
  particle.rotation.y -= 0.0004;

  if (atTunnel && !tunnelDone) {
    currentCameraPercentage = cameraTargetPercentage;
    updateCameraPercentage(currentCameraPercentage);
  }
  // console.log(camera.position.x, camera.position.y, camera.position.z);
  renderer.render(scene, camera);
}

render();

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

// animation

gsap.registerPlugin(ScrollTrigger);

const slide1 = gsap.timeline({
  scrollTrigger: {
    trigger: '.slide1',
    scrub: 1,
    start: '20 0',
    end: '100% 100%',
  },
});

slide1
  .to(
    camera.position,
    { z: camera.position.z, y: camera.position.y },
    {
      z: 220,
      y: 50,
    }
  )
  .to(camera.position, {
    z: 300,
    y: 0,
  })
  .fromTo(
    camera.rotation,
    { y: 0 },
    {
      y: 0.8,
    }
  );

const slide2 = gsap.timeline({
  scrollTrigger: {
    trigger: '.slide2',
    scrub: 1,
    start: '20 0',
    end: '100% 100%',
  },
});

slide2.to(camera.rotation, {
  y: -0.8,
});

const slide3 = gsap.timeline({
  scrollTrigger: {
    trigger: '.slide3',
    scrub: 1,
    start: '20 0',
    end: '100% 100%',
  },
});

slide3
  .to(camera.position, {
    z: 800,
  })
  .to(
    camera.rotation,
    {
      y: 0,
    },
    '<'
  );

const tunnelMouth = gsap.timeline({
  scrollTrigger: {
    trigger: '.slide4',
    scrub: 1,
    start: '20 0',
  },
  onUpdate: () => {
    camera.lookAt(0, 0, 0);
    if (tunnelMouth.progress() > 0.7) {
      tube.traverse((child) => {
        child.visible = true;
      });
      wireframe.traverse((child) => {
        child.visible = true;
      });
    } else {
      tube.traverse((child) => {
        child.visible = false;
      });
      wireframe.traverse((child) => {
        child.visible = false;
      });
    }
  },
});

tunnelMouth.to(camera.position, {
  x: path.getPointAt(0 % 1).x - 100,
  y: path.getPointAt(0 % 1).y,
  z: path.getPointAt(0 % 1).z - 100,
});

const rotationValue = {
  r: 0,
};

const tunnelMouthRotate = gsap.timeline({
  onUpdate: () => {
    camera.lookAt(
      44.17 * rotationValue.r,
      8.38 * rotationValue.r,
      85.85 * rotationValue.r
    );
  },
  onComplete: () => {
    atTunnel = true;
    planet.traverse((child) => {
      child.visible = false;
    });
    planetSkeleton.traverse((child) => {
      child.visible = false;
    });
    cloud.traverse((child) => {
      child.visible = false;
    });
  },
  scrollTrigger: {
    trigger: '.slide5',
    scrub: 1,
    start: '20 0',
    end: '100% 100%',
  },
});
tunnelMouthRotate
  .to(camera.position, {
    x: path.getPointAt(0 % 1).x,
    z: path.getPointAt(0 % 1).z,
  })
  .to(rotationValue, { r: 1 }, '<');

let tunnel = gsap.timeline({
  scrollTrigger: {
    trigger: '.tunnel',
    start: '0 0',
    scrub: 5,
    // markers: true,
  },
});

tunnel.to(tubePerc, {
  percent: 0.96,
  ease: Linear.easeNone,
  onUpdate: function () {
    if (tubePerc.percent >= 0.7 && !torusAdded) {
      addDisco();
      torusAdded = true;
    }
    cameraTargetPercentage = tubePerc.percent;
  },
});

const slide7 = gsap.timeline({
  scrollTrigger: {
    trigger: '.slide7',
    scrub: 1,
    start: '20 0',
    end: '100% 100%',
    markers: true,
  },
  onUpdate: () => {
    if (!tunnelDone) {
      tunnelDone = true;
    }
  },
});

slide7.to(camera.position, {
  x: 450,
  z: 60,
  y: -100,
});

// about me
// projects
// links
// skills
// experience

// 360/5 = 72, 72 degree viewport
