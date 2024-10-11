import { useRouter } from "next/router"; // Import the router for navigation
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Planet from "../lib/planet";

// Constants for orbit calculations
const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60); // Orbital speed of Earth
const MOON_ORBIT_SPEED = EARTH_YEAR * 3; // Speed of the Moon's orbit around Earth

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null); // Reference to the DOM container for the Three.js canvas
  const [showMissionPrompt, setShowMissionPrompt] = useState(false); // State to show the mission prompt
  const [restart, setRestart] = useState(false); // State to manage scene restart
  const [showInitialPopup, setShowInitialPopup] = useState(true); // State to show the initial popup
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // State to manage speed multiplier
  const [showGuide, setShowGuide] = useState(false); // State to show the guide popup
  const [showVideo, setShowVideo] = useState(false); // State to show the video
  const router = useRouter(); // Use router for navigation

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000,
    );

    camera.position.set(0, 100, 150); // Set the camera position

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1); // Set the background color to black to avoid any lines or artifacts
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high-density screens
    containerRef.current.appendChild(renderer.domElement); // Add the renderer to the DOM

    // Handle window resizing
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Camera controls to allow mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true; // Allow panning with the mouse
    controls.enableRotate = true; // Allow rotation with the mouse
    controls.minDistance = 50; // Minimum distance for zooming
    controls.maxDistance = 1000; // Maximum distance for zooming
    controls.enableDamping = true; // Adds damping (smooth) effect to the controls
    controls.dampingFactor = 0.1; // Damping factor for smooth control movement

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light with intensity of 0.5
    scene.add(ambientLight);

    // Create the Sun
    const sunGeometry = new THREE.SphereGeometry(Math.sqrt(696.34));
    const sunTexture = new THREE.TextureLoader().load("sun.jpeg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial); // Sun mesh representation
    const solarSystem = new THREE.Group(); // Group to represent the entire solar system

    solarSystem.add(sunMesh); // Add the Sun to the solar system group

    // Create starry background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1, // Set star size for better visibility
    });
    const starVertices = [];

    // Generate random positions for stars
    for (let i = 0; i < 15000; i++) { // Increased number of stars for better coverage
      const x = THREE.MathUtils.randFloatSpread(4000);
      const y = THREE.MathUtils.randFloatSpread(4000);
      const z = THREE.MathUtils.randFloatSpread(4000);

      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3),
    );
    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars); // Add stars to the scene

    // Define data for the planets
    const planetsData = [
      {
        name: "Mercury",
        size: Math.sqrt(2.4405),
        texture: "mercury.png",
        semiMajorAxis: Math.sqrt(57.9) * 4,
        semiMinorAxis: Math.sqrt(55.9) * 4,
        speed: EARTH_YEAR * 4,
        rotationSpeed: 0.06,
      },
      {
        name: "Venus",
        size: Math.sqrt(6.0518),
        texture: "venus.jpeg",
        semiMajorAxis: Math.sqrt(108.2) * 6,
        semiMinorAxis: Math.sqrt(107.7) * 6,
        speed: EARTH_YEAR * 2,
        rotationSpeed: 0.003,
      },
      {
        name: "Earth",
        size: Math.sqrt(6.3781),
        texture: "earth.jpeg",
        semiMajorAxis: Math.sqrt(149.6) * 8,
        semiMinorAxis: Math.sqrt(147.7) * 8,
        speed: EARTH_YEAR,
        rotationSpeed: 0.03,
      },
      {
        name: "Mars",
        size: Math.sqrt(3.389),
        texture: "mars.jpeg",
        semiMajorAxis: Math.sqrt(228) * 10,
        semiMinorAxis: Math.sqrt(222.3) * 10,
        speed: EARTH_YEAR * 0.5,
        rotationSpeed: 0.024,
      },
      {
        name: "Jupiter",
        size: Math.sqrt(71.492),
        texture: "jupiter.jpeg",
        semiMajorAxis: Math.sqrt(778.5) * 11,
        semiMinorAxis: Math.sqrt(775) * 11,
        speed: EARTH_YEAR * 0.1,
        rotationSpeed: 0.09,
      },
      {
        name: "Saturn",
        size: Math.sqrt(60.268),
        texture: "saturn.jpeg",
        semiMajorAxis: Math.sqrt(1411.6) * 12,
        semiMinorAxis: Math.sqrt(1399.4) * 12,
        speed: EARTH_YEAR * 0.05,
        rotationSpeed: 0.075,
      },
      {
        name: "Uranus",
        size: Math.sqrt(25.559),
        texture: "uranus.jpeg",
        semiMajorAxis: Math.sqrt(2867.6) * 13,
        semiMinorAxis: Math.sqrt(2846.9) * 13,
        speed: EARTH_YEAR * 0.025,
        rotationSpeed: 0.066,
      },
      {
        name: "Neptune",
        size: Math.sqrt(24.764),
        texture: "neptune.jpg",
        semiMajorAxis: Math.sqrt(4465) * 14,
        semiMinorAxis: Math.sqrt(4462.3) * 14,
        speed: EARTH_YEAR * 0.0125,
        rotationSpeed: 0.054,
      },
    ];

    const planetMeshes: {
      mesh: THREE.Mesh;
      semiMajorAxis: number;
      semiMinorAxis: number;
      speed: number;
      angle: number;
      rotationSpeed: number;
    }[] = [];

    let earthMesh: THREE.Mesh | null = null;
    let moonMesh: THREE.Mesh | null = null;
    let moonAngle = 0; // Angle for the Moon's orbit

    // Create planets and add them to the solar system
    planetsData.forEach((planetData) => {
      const planet = new Planet(planetData.size, 32, planetData.texture);
      const planetMesh = planet.getMesh(); // Get the planet's mesh

      planetMeshes.push({
        mesh: planetMesh,
        semiMajorAxis: planetData.semiMajorAxis,
        semiMinorAxis: planetData.semiMinorAxis,
        speed: planetData.speed,
        angle: Math.random() * Math.PI * 2, // Random angle to start the orbit
        rotationSpeed: planetData.rotationSpeed,
      });
      solarSystem.add(planetMesh); // Add the planet to the solar system group
      if (planetData.name === "Earth") earthMesh = planetMesh;

      // Add rings to Saturn
      if (planetData.name === "Saturn") {
        const ringGeometry1 = new THREE.RingGeometry(
          Math.sqrt(92) * 1.1,
          Math.sqrt(117.5) * 1.1,
          64,
        );
        const ringGeometry2 = new THREE.RingGeometry(
          Math.sqrt(122) * 1.12,
          Math.sqrt(137) * 1.3,
          64,
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xd1c27d, // Set the color of the rings, similar to the real color of Saturn's rings
          side: THREE.DoubleSide,
        });
        const ringMesh1 = new THREE.Mesh(ringGeometry1, ringMaterial);
        const ringMesh2 = new THREE.Mesh(ringGeometry2, ringMaterial);

        ringMesh1.position.set(0, 0, 0);
        ringMesh2.position.set(0, 0, 0);

        // Rotate the rings so they are aligned with Saturn's axis
        ringMesh1.rotation.x = Math.PI / 2;
        ringMesh2.rotation.x = Math.PI / 2;
        planetMesh.add(ringMesh1, ringMesh2);
      }
    });

    // Add the solar system group to the scene
    scene.add(solarSystem);

    // Create the Moon and add it around the Earth
    if (earthMesh) {
      const moonGeometry = new THREE.SphereGeometry(Math.sqrt(1.737));
      const moonTexture = new THREE.TextureLoader().load("moon.png");
      const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

      moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const earthMoonGroup = new THREE.Group();

      earthMoonGroup.add(earthMesh); // Add the Earth to the Earth-Moon group
      earthMoonGroup.add(moonMesh); // Add the Moon to the Earth-Moon group
      solarSystem.add(earthMoonGroup); // Add the Earth-Moon group to the solar system
      moonMesh.position.set(Math.sqrt(138), 0, 0); // Set the initial position of the Moon
    }

    interface Asteroid {
      semiMajorAxis: number;
      semiMinorAxis: number;
      speed: number;
      angle: number;
    }

    // Generate 10000 asteroids
    const numAsteroids = 10000;

    // Declare the asteroid data array with the defined interface
    const asteroidData: Asteroid[] = [];

    const positions = new Float32Array(numAsteroids * 3); // x, y, z for each asteroid

    // Create asteroid belt
    for (let i = 0; i < numAsteroids; i++) {
      // Define the orbital parameters of the asteroid
      const semiMajorAxis = THREE.MathUtils.randFloat(
        Math.sqrt(313) * 10.5,
        Math.sqrt(493) * 10.5,
      ); // Major axis of the orbit
      const semiMinorAxis =
        semiMajorAxis * THREE.MathUtils.randFloat(0.95, 1.05); // Minor axis of the orbit
      const speed = EARTH_YEAR * THREE.MathUtils.randFloat(0.1, 0.5); // Orbital speed
      const angle = Math.random() * Math.PI * 2; // Random initial angle

      // Store the asteroid data
      asteroidData.push({
        semiMajorAxis,
        semiMinorAxis,
        speed,
        angle,
      });

      // Initial positions
      positions[i * 3] = semiMajorAxis * Math.cos(angle); // x position
      positions[i * 3 + 1] = Math.random() * Math.PI * 2; // y position
      positions[i * 3 + 2] = semiMinorAxis * Math.sin(angle); // z position
    }

    // Create the material for the asteroid points
    const asteroidMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.5, // Set the size of each point (asteroid)
    });

    // Create the geometry for the asteroid points
    const asteroidGeometry = new THREE.BufferGeometry();

    asteroidGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const asteroidPoints = new THREE.Points(asteroidGeometry, asteroidMaterial);

    scene.add(asteroidPoints); // Add the asteroids to the scene

    // Animation function to update the scene
    const animate = () => {
      requestAnimationFrame(animate); // Request the next frame

      // Rotate the Sun
      sunMesh.rotation.y += 0.001 * speedMultiplier;

      // Update the orbits of the planets
      planetMeshes.forEach((planet) => {
        planet.angle += planet.speed * speedMultiplier; // Update the orbital angle
        planet.mesh.position.x = planet.semiMajorAxis * Math.cos(planet.angle); // Update x position
        planet.mesh.position.z = planet.semiMinorAxis * Math.sin(planet.angle); // Update z position
        planet.mesh.rotation.y += planet.rotationSpeed * speedMultiplier; // Rotate the planet
      });

      // Update the orbit of the Moon around the Earth
      if (moonMesh && earthMesh) {
        moonAngle += MOON_ORBIT_SPEED * speedMultiplier;
        const moonDistance = Math.sqrt(138); // Distance of the Moon from the Earth

        moonMesh.position.x =
          earthMesh.position.x + moonDistance * Math.cos(moonAngle); // Update x position
        moonMesh.position.z =
          earthMesh.position.z + moonDistance * Math.sin(moonAngle); // Update z position
      }

      // Update the positions of the asteroids
      for (let i = 0; i < numAsteroids; i++) {
        const asteroid = asteroidData[i];

        asteroid.angle += asteroid.speed * speedMultiplier; // Update the angle
        positions[i * 3] = asteroid.semiMajorAxis * Math.cos(asteroid.angle); // Update x position
        positions[i * 3 + 2] =
          asteroid.semiMinorAxis * Math.sin(asteroid.angle); // Update z position
      }

      // Update the geometry with new positions
      asteroidGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      controls.update(); // Update the camera controls
      renderer.render(scene, camera); // Render the scene
    };

    animate(); // Start the animation loop

    // Event listener for key press to adjust speed
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "2") {
        setSpeedMultiplier((prev) => prev * 2); // Double the speed
      } else if (event.key === "3") {
        setSpeedMultiplier((prev) => prev / 2); // Halve the speed
      } else if (event.key === "1") {
        setShowGuide(true); // Show the guide
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [restart, speedMultiplier]); // Restart the scene if needed

  // Function to handle the user's response to the mission prompt
  const handleUserResponse = (response: string) => {
    if (response === "yes") {
      setShowVideo(true); // Show the video in full screen
    } else if (response === "no") {
      setShowMissionPrompt(false); // Hide the mission prompt
    }
  };

  // Function to handle the end of the video
  const handleVideoEnd = () => {
    setShowVideo(false); // Hide the video
    router.push("/game"); // Redirect to the /game page
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center"
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(to bottom, #000428, #004e92)", // Space gradient background
      }}
    >
      {showInitialPopup && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            textAlign: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background for space theme
            padding: "40px",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.8)", // Space glow effect
            animation: "zoomIn 1s ease-in-out",
          }}
        >
          <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Welcome to the Solar System Simulation!</h1>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            This simulation uses a simplified model of our solar system. The distances and sizes are scaled to fit within the visual scene,
            with the semi-major and semi-minor axes calculated using approximate values to create visually accurate orbits.
          </p>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            The code is designed to create a realistic representation of the solar system, including planets, moons, and asteroid belts. The Three.js library
            is used to render the scene, while the OrbitControls allow you to navigate around the solar system.
          </p>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Press the "1" key to display a guide of all available controls. Press the "2" key to double the speed of the entire solar system rotation, and press the "3" key to halve the speed.
          </p>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#32cd32",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(50, 205, 50, 0.8)",
            }}
            onClick={() => setShowInitialPopup(false)}
          >
            OK
          </button>
        </div>
      )}

      <button
        style={{
          position: "fixed", // Set to fixed to ensure it stays in place
          top: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "#1a1a1a",
          color: "#f8f8ff",
          border: "3px solid #ffffff",
          borderRadius: "15px",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 0 30px rgba(255, 255, 255, 0.8)", // Space glow effect
          backgroundImage: "url('galactic_background.jpg')", // Background image for galactic theme
          backgroundSize: "cover",
          textShadow: "0 0 10px #ffffff",
        }}
        onClick={() => setShowMissionPrompt(true)}
      >
        DON'T PANIC!
      </button>

      {showMissionPrompt && (
        <div
          style={{
            position: "fixed", // Ensure the prompt stays centered
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            backgroundColor: "white", // White background for the message
            padding: "40px", // Padding for a larger appearance
            borderRadius: "15px", // Rounded corners for the prompt
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.7)", // Shadow to make the prompt stand out
            animation: "zoomIn 0s ease-in-out", // Instant appearance without delay
            color: "black",
          }}
        >
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            Do you want to start the game?
          </h1>
          <div style={{ marginTop: "20px" }}>
            <button
              style={{
                padding: "15px 30px", // Increased padding for better UX
                backgroundColor: "#32cd32",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "20px",
                marginRight: "10px",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(50, 205, 50, 0.8)",
                animation: "pulseGreen 2s infinite", // Pulsing effect for YES button
              }}
              onClick={() => handleUserResponse("yes")}
            >
              YES
            </button>
            <button
              style={{
                padding: "15px 30px", // Increased padding for better UX
                backgroundColor: "#ff4500",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "20px",
                marginLeft: "10px",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255, 69, 0, 0.8)",
              }}
              onClick={() => handleUserResponse("no")}
            >
              NO
            </button>
          </div>
        </div>
      )}

      {showGuide && (
        <div
          style={{
            position: "fixed", // Set to fixed to ensure it stays in place
            top: "20%",
            left: "20%",
            right: "20%",
            textAlign: "center",
            backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark background for the guide
            padding: "30px",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.8)", // Glow effect for guide
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Guide to Controls:</h2>
          <ul style={{ listStyleType: "none", padding: 0, lineHeight: "1.8" }}>
            <li><strong>1</strong>: Display this guide.</li>
            <li><strong>2</strong>: Double the speed of the entire solar system rotation and recenter the view.</li>
            <li><strong>3</strong>: Halve the speed of the entire solar system rotation and recenter the view.</li>
          </ul>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#32cd32",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(50, 205, 50, 0.8)",
            }}
            onClick={() => setShowGuide(false)}
          >
            Close Guide
          </button>
        </div>
      )}

      {showVideo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            zIndex: 1000,
          }}
        >
          <video
            src="/lv_0_20241006103358.mp4"
            autoPlay
            controls={false}
            style={{ width: "100%", height: "100%" }}
            onEnded={handleVideoEnd}
          />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
          }
          50% {
            box-shadow: 0 0 60px rgba(255, 255, 255, 1);
          }
          100% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
          }
        }

        @keyframes pulseGreen {
          0% {
            box-shadow: 0 0 30px rgba(50, 205, 50, 0.8);
          }
          50% {
            box-shadow: 0 0 60px rgba(50, 205, 50, 1);
          }
          100% {
            box-shadow: 0 0 30px rgba(50, 205, 50, 0.8);
          }
        }

        @keyframes zoomIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/*
  Guida molto semplificata in italiano:
  Questo codice crea una simulazione del sistema solare utilizzando la libreria Three.js. Viene creata una scena in cui sono presenti il Sole, i pianeti, la Luna e una cintura di asteroidi.
  Ogni pianeta ha un'orbita calcolata e visualizzata in modo realistico. L'utente può interagire con la simulazione utilizzando i controlli del mouse (pan e rotazione) e modificando la velocità di rotazione.
  Inoltre, il codice include diversi popup per aiutare l'utente a capire e navigare la simulazione. Se l'utente accetta di giocare, viene mostrato un video in full screen e successivamente reindirizzato alla pagina del gioco.
*/