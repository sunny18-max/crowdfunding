import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls, Text, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

function StarField() {
  const ref = useRef();
  const { viewport } = useThree();
  
  // Generate random positions for stars with different sizes and colors
  const particles = useMemo(() => {
    const temp = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < 10000; i++) {
      // Position
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      temp.push(x, y, z);
      
      // Color - mix of blue, purple, and white
      const color = new THREE.Color();
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        color.setHSL(0.6, 0.9, 0.5 + Math.random() * 0.3); // Blue
      } else if (colorChoice < 0.66) {
        color.setHSL(0.8, 0.8, 0.5 + Math.random() * 0.3); // Purple
      } else {
        color.setHSL(0, 0, 0.8 + Math.random() * 0.2); // White
      }
      colors.push(color.r, color.g, color.b);
      
      // Size
      sizes.push(0.1 + Math.random() * 0.5);
    }
    
    return {
      positions: new Float32Array(temp),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes)
    };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.x = t * 0.02;
      ref.current.rotation.y = t * 0.015;
      ref.current.rotation.z = t * 0.01;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particles.positions} colors={particles.colors} sizes={particles.sizes} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          alphaTest={0.01}
        />
      </Points>
    </group>
  );
}

function FloatingShape({ position, size, color, speed, shape = 'box' }) {
  const mesh = useRef();
  const initialRotation = useMemo(() => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ], []);

  useFrame(({ clock }) => {
    if (mesh.current) {
      const t = clock.getElapsedTime();
      mesh.current.rotation.x = initialRotation[0] + t * speed * 0.3;
      mesh.current.rotation.y = initialRotation[1] + t * speed * 0.5;
      mesh.current.rotation.z = initialRotation[2] + t * speed * 0.2;
      
      // Floating animation
      mesh.current.position.y = position[1] + Math.sin(t * speed) * 1.5;
      mesh.current.position.x = position[0] + Math.cos(t * speed * 0.7) * 0.5;
    }
  });

  const geometry = useMemo(() => {
    switch(shape) {
      case 'sphere':
        return <sphereGeometry args={[size, 24, 24]} />;
      case 'torus':
        return <torusGeometry args={[size, size * 0.3, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size, 0]} />;
      default: // box
        return <boxGeometry args={[size, size, size]} />;
    }
  }, [shape, size]);

  return (
    <mesh ref={mesh} position={position} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.8}
        wireframe={Math.random() > 0.5}
      />
    </mesh>
  );
}

function FloatingText({ position, children, size = 1, color = 'white' }) {
  const textRef = useRef();
  
  useFrame(({ camera }) => {
    // Make text face the camera
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position} ref={textRef}>
      <Text
        color={color}
        anchorX="center"
        anchorY="middle"
        fontSize={size}
        lineHeight={1}
        letterSpacing={0.02}
        maxWidth={10}
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaq5N.woff"
      >
        {children}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Text>
    </group>
  );
}

function Scene() {
  const shapes = useMemo(() => {
    const shapes = [];
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#3b82f6', // Blue
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444'  // Red
    ];
    
    // Add random floating shapes
    for (let i = 0; i < 8; i++) {
      shapes.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          -Math.random() * 100 - 20
        ],
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.005 + Math.random() * 0.02,
        shape: ['box', 'sphere', 'torus', 'octahedron'][Math.floor(Math.random() * 4)]
      });
    }
    return shapes;
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, 0]} intensity={0.5} color="#ec4899" />
      <pointLight position={[0, 10, 10]} intensity={0.8} color="#3b82f6" />
      
      <StarField />
      
      {/* Floating shapes */}
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} />
      ))}
      
      {/* Floating text elements */}
      <FloatingText position={[0, 8, -30]} size={2} color="#ffffff">
        Crowdfund
      </FloatingText>
      <FloatingText position={[0, 5, -30]} size={1} color="#a5b4fc">
        Fund Your Dreams
      </FloatingText>
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom 
          intensity={0.5} 
          kernelSize={3} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.7} 
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Canvas 
        camera={{ position: [0, 0, 30], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

export default ThreeBackground;
