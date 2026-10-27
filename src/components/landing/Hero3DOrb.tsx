'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function Hero3DOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check prefers-reduced-motion or mobile
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // WebGL support test
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // Outer translucent faceted glass orb
    const geometry = new THREE.IcosahedronGeometry(1.4, 3);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x2e1065,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85, // Glass effect
      ior: 1.5,
      transparent: true,
      opacity: 0.75,
      wireframe: false,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Inner glowing core
    const innerGeo = new THREE.IcosahedronGeometry(0.7, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xc4b5fd,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerCore);

    // Orbital ring 1
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    // Orbital ring 2
    const ring2Geo = new THREE.TorusGeometry(2.1, 0.01, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa78bfa, 3, 10);
    pointLight.position.set(3, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x6366f1, 2, 10);
    pointLight2.position.set(-3, -2, -2);
    scene.add(pointLight2);

    // Mouse tilt tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetRotX = y * 0.8;
      targetRotY = x * 0.8;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animationId: number;
    const startTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Idle rotation + target interpolation
      orb.rotation.y += 0.006;
      orb.rotation.x += (targetRotX - orb.rotation.x) * 0.05;
      orb.rotation.z += (targetRotY - orb.rotation.z) * 0.05;

      innerCore.rotation.y -= 0.008;
      innerCore.rotation.x += 0.004;

      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.x = elapsedTime * -0.12;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    // Beautiful SVG static fallback
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-purple-400/30 blur-2xl animate-pulse" />
        <div className="absolute w-48 h-48 rounded-full border border-violet-500/40 bg-violet-600/10 backdrop-blur-md flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-violet-400/60 bg-violet-500/20 shadow-lg shadow-violet-500/50" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-80 sm:h-96 md:h-[420px] flex items-center justify-center relative select-none pointer-events-none"
    />
  );
}
