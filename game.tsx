import { Stars, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Game() {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '10px',    
        left: '10px',
        color: 'white',
        fontSize: '24px',
        padding: '10px 20px',
        backgroundColor: 'rgba(0, 128, 255, 0.7)',
        borderRadius: '8px',
        boxShadow: '0px 0px 10px rgba(0, 255, 255, 0.8)',
        border: '2px solid #00ffff'
      }}>
        Score: {score}
        <div style={{
          fontSize: '12px',
          marginTop: '10px',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 128, 255, 0.7)',
          padding: '5px',
          borderRadius: '5px',
          boxShadow: '0px 0px 5px rgba(0, 255, 255, 0.8)',
          border: '1px solid #00ffff'
        }}>
          Legend: <br />
          - Red asteroids: Potentially Hazardous Asteroids (PHA) <br />
          - White asteroids: Neutral Asteroids

          
          <br/>
          Eat the PHA for 1 POINT!
          <br/>
          Avoid the neutral asteroids...
          
        </div>
      </div>
      {isGameOver && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          padding: '15px 30px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          boxShadow: '0px 0px 15px rgba(255, 0, 0, 1)',
          border: '2px solid #ff0000'
        }}>
          LOSE!!! Type R to retry
          <div style={{ marginTop: '10px', fontSize: '16px' }}>
          Even if you lost, <strong>Don't panic!</strong> because there's 
            <strong> DART Mission (Double Asteroid Redirection Test):</strong>
            <ul>
              <li>Managed by Johns Hopkins APL for NASA’s Planetary Defense Coordination Office, DART was the first planetary defense demonstration using a kinetic impactor to deflect an asteroid.</li>
              <li>Launched on November 24, 2022, DART traveled 10 months before colliding with Dimorphos, a 530-foot moonlet orbiting a larger asteroid, Didymos.</li>
              <li>DART successfully changed Dimorphos’ orbit, marking the first time humanity altered the path of a celestial object, shortening its orbit by 32 minutes.</li>
              <li>The impact created "ejecta," enhancing DART’s push on Dimorphos, and the mission is advancing models for asteroid deflection.</li>
              <li>More research is needed to understand if a kinetic impactor is effective for different types of asteroids, necessitating further planetary defense tests.</li>
            </ul>
            <strong>Hera Mission (Launch planned for 2024):</strong>
            <ul>
              <li>Hera will follow up on NASA’s DART mission by visiting the same asteroid system (Didymos and Dimorphos) to measure the impact crater left by DART, analyze the debris (ejecta), and better understand the asteroid's structure and composition.</li>
              <li>The mission aims to gather data on the effectiveness of asteroid deflection via kinetic impact, providing more insight into asteroid properties and planetary defense strategies.</li>
            </ul>
          </div>
</div>
      )}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ width: '100%', height: '100vh' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[50, 50, 50]} intensity={2.0} />
        <Stars radius={1000} depth={50} count={10000} factor={4} saturation={0} fade />
        <Earth />
        <Asteroids setScore={setScore} setIsGameOver={setIsGameOver} />
        <Spaceship setScore={setScore} setIsGameOver={setIsGameOver} isGameOver={isGameOver} />
      </Canvas>
    </>
  );
}

// Component per la Terra
function Earth() {
  const texture = new THREE.TextureLoader().load('earth.jpeg');
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001; // Rotazione lenta della Terra
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]} name="earth">
      <sphereGeometry args={[6, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// Component per gli asteroidi
function Asteroids({ setScore, setIsGameOver }) {
  const { scene } = useThree();
  const [asteroids, setAsteroids] = useState([]);
  const apiKey = 'aB5ASTBsdKFPiiDjEMAIDaTu2aSY3m67fYqOOBuT';

  useEffect(() => {
    async function fetchAsteroids() {
      try {
        const response = await fetch(
          `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`
        );
        const data = await response.json();
        const asteroidData = data.near_earth_objects;

        const newAsteroids = asteroidData
          .filter((asteroid) => asteroid.close_approach_data.some((approach) => approach.orbiting_body === 'Earth'))
          .map((asteroid) => {
            const approachData = asteroid.close_approach_data.find(
              (approach) => approach.orbiting_body === 'Earth'
            );
            const isHazardous = asteroid.is_potentially_hazardous_asteroid;
            const geometry = new THREE.SphereGeometry(Math.random() * 0.05 + 1, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: isHazardous ? 0xff0000 : 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);
            const distance = parseFloat(approachData.miss_distance.kilometers) / 1000;
            mesh.position.set(
              (Math.random() - 0.5) * Math.sqrt(distance),
              (Math.random() - 0.5) * Math.sqrt(distance),
              (Math.random() - 0.5) * Math.sqrt(distance)
            );
            mesh.userData.isHazardous = isHazardous;
            return mesh;
          });

        setAsteroids(newAsteroids);
        newAsteroids.forEach((asteroid) => scene.add(asteroid));
      } catch (error) {
        console.error('Failed to fetch asteroids:', error);
      }
    }

    fetchAsteroids();
  }, [scene]);

  useFrame(() => {
    const spaceship = scene.getObjectByName('spaceship');
    asteroids.forEach((asteroid, index) => {
      // Movimento lento degli asteroidi rossi verso la Terra
      if (asteroid.userData.isHazardous) {
        asteroid.position.lerp(new THREE.Vector3(0, 0, 0), 0.0001);
      }

      if (spaceship && asteroid.position.distanceTo(spaceship.position) < 10) {
        if (asteroid.userData.isHazardous) {
          setScore((prevScore) => prevScore + 1);
        } else {
          setIsGameOver(true);
        }
        scene.remove(asteroid);
        asteroids.splice(index, 1);
      }
    });
  });

  return null;
}

// Component per l'astronave
function Spaceship({ setScore, setIsGameOver, isGameOver }) {
  const ref = useRef();
  const gltf = useGLTF('spaceship.glb');
  const { camera, gl } = useThree();
  const [keysPressed, setKeysPressed] = useState({});
  const [acceleration, setAcceleration] = useState(1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: true }));
      if (event.key.toLowerCase() === ' ') {
        setAcceleration(3); // Turbo quando viene premuta la barra spaziatrice
      }
    };

    const handleKeyUp = (event) => {
      setKeysPressed((prev) => ({ ...prev, [event.key.toLowerCase()]: false }));
      if (event.key.toLowerCase() === ' ') {
        setAcceleration(1); // Rilascia il turbo
      }
    };

    const handleMouseMove = (event) => {
      if (ref.current) {
        const { width, height } = gl.domElement;
        const mouseX = (event.clientX / width) * 2 - 1;
        const mouseY = -(event.clientY / height) * 2 + 1;

        ref.current.rotation.y = mouseX * 0.5; // Ruota l'astronave in base alla posizione del mouse
        ref.current.rotation.x = mouseY * 0.5;
      }
    };

    const handleMouseClick = () => {
      if (ref.current) {
        ref.current.rotation.set(0, 0, 0); // Raddrizza l'astronave
      }
    };

    const handleRestart = (event) => {
      if (event.key.toLowerCase() === 'r' && isGameOver) {
        window.location.reload(); // Ricarica la pagina per riprovare
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    window.addEventListener('keydown', handleRestart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('keydown', handleRestart);
    };
  }, [gl, isGameOver]);

  useFrame((state, delta) => {
    if (ref.current && !isGameOver) {
      let speed = 50 * delta * acceleration;
      const rotationSpeed = 1.5;

      // Movimento con le frecce (su/giù/sinistra/destra)
      if (keysPressed['arrowup']) {
        ref.current.translateY(speed);
      }
      if (keysPressed['arrowdown']) {
        ref.current.translateY(-speed);
      }
      if (keysPressed['arrowleft']) {
        ref.current.translateX(-speed);
      }
      if (keysPressed['arrowright']) {
        ref.current.translateX(speed);
      }

      // Rotazione e inclinazione con W-A-S-D
      if (keysPressed['w']) {
        ref.current.translateZ(-speed); // Avanti
      }
      if (keysPressed['s']) {
        ref.current.translateZ(speed); // Indietro
      }
      if (keysPressed['a']) {
        ref.current.rotateZ(rotationSpeed * delta); // Inclinazione a sinistra
      }
      if (keysPressed['d']) {
        ref.current.rotateZ(-rotationSpeed * delta); // Inclinazione a destra
      }

      // Nuovi movimenti con Q-E per inclinazione laterale
      if (keysPressed['q']) {
        ref.current.rotateX(rotationSpeed * delta); // Inclinazione verso sinistra
      }
      if (keysPressed['e']) {
        ref.current.rotateX(-rotationSpeed * delta); // Inclinazione verso destra
      }

      // Nuovi movimenti con I-J-K-L per muoversi lungo gli assi
      if (keysPressed['i']) {
        ref.current.translateZ(-speed); // Muovi avanti
      }
      if (keysPressed['k']) {
        ref.current.translateZ(speed); // Muovi indietro
      }
      if (keysPressed['j']) {
        ref.current.translateX(-speed); // Muovi a sinistra
      }
      if (keysPressed['l']) {
        ref.current.translateX(speed); // Muovi a destra
      }

      // Controllo collisione con la Terra
      const distanceToEarth = ref.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
      if (distanceToEarth < 8) {
        setIsGameOver(true);
      }

      // Aggiorna la posizione della telecamera per seguire l'astronave
      const targetPosition = new THREE.Vector3();
      ref.current.getWorldPosition(targetPosition);
      camera.position.lerp(new THREE.Vector3(targetPosition.x, targetPosition.y + 10, targetPosition.z + 20), 0.1);
      camera.lookAt(targetPosition);
    }
  });

  return (
    <group ref={ref} name="spaceship" position={[0, 0, 300]}>
      <primitive object={gltf.scene} scale={[0.07, 0.07, 0.07]} />
      <meshStandardMaterial color={0x00ff00} emissive={0x004400} metalness={0.8} roughness={0.2} />
    </group>
  );
}

useGLTF.preload('spaceship.glb');