'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WelcomeHeroSceneProps {
  className?: string;
}

export function WelcomeHeroScene({ className = '' }: WelcomeHeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setHasWebGL(false);
      return;
    }

    // Detect touch-first screen
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    const container = containerRef.current;
    if (!container) return;

    // ─── 1. WebGL Support Test & Renderer Setup ─────────────────────────────
    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return Boolean(window.WebGLRenderingContext && gl);
      } catch {
        return false;
      }
    };

    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    const initialWidth = container.clientWidth || 500;
    const initialHeight = container.clientHeight || 500;

    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // ─── 2. Scene & Camera Setup ────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, initialWidth / initialHeight, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Master group for coordinated scene rotation & parallax
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // ─── 3. Palette & Materials Definition (Calm Living Productivity) ─────────
    // Warm Neutral & Sage Green Color Tokens
    const COLOR_SAGE_DEEP = 0x5f7157;
    const COLOR_SAGE_MID = 0x718368;
    const COLOR_SAGE_LIGHT = 0x8fa185;
    const COLOR_IVORY_WARM = 0xf4e9de;
    const COLOR_CREAM_SOFT = 0xfbf9f5;
    const COLOR_GOLDEN_WARMTH = 0xd4b895;

    // A. Main Translucent Glass Orb
    const mainOrbGeo = new THREE.SphereGeometry(1.08, 48, 48);
    const mainOrbMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_SAGE_LIGHT,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.82,
      thickness: 0.9,
      ior: 1.45,
      transparent: true,
      opacity: 0.88,
    });
    const mainOrb = new THREE.Mesh(mainOrbGeo, mainOrbMat);
    masterGroup.add(mainOrb);

    // B. Inner Luminous Core (Soft Warm Ivory Essence)
    const innerCoreGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: COLOR_CREAM_SOFT,
      emissive: COLOR_IVORY_WARM,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.0,
      transparent: true,
      opacity: 0.72,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    mainOrb.add(innerCore);

    // C. Flowing Organic Ribbon (Smooth Torus Knot with Satin Sheen)
    const ribbonGeo = new THREE.TorusKnotGeometry(1.48, 0.052, 180, 28, 2, 3);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: COLOR_SAGE_MID,
      roughness: 0.28,
      metalness: 0.18,
      transparent: true,
      opacity: 0.7,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    masterGroup.add(ribbon);

    // D. Secondary Satellite Glass Orb
    const satelliteGeo = new THREE.SphereGeometry(0.44, 36, 36);
    const satelliteMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_IVORY_WARM,
      roughness: 0.16,
      metalness: 0.05,
      transmission: 0.86,
      thickness: 0.6,
      ior: 1.42,
      transparent: true,
      opacity: 0.82,
    });
    const satellite = new THREE.Mesh(satelliteGeo, satelliteMat);
    satellite.position.set(-1.65, 0.95, 0.3);
    masterGroup.add(satellite);

    // E. Dewdrop Accent Orb
    const dewdropGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const dewdropMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_SAGE_LIGHT,
      roughness: 0.1,
      metalness: 0.02,
      transmission: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    const dewdrop = new THREE.Mesh(dewdropGeo, dewdropMat);
    dewdrop.position.set(1.5, -1.05, 0.5);
    masterGroup.add(dewdrop);

    // F. Organic Sculpted Leaf Form (Taskora Natural Growth Motif)
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -0.75);
    leafShape.bezierCurveTo(0.48, -0.4, 0.55, 0.35, 0, 0.85);
    leafShape.bezierCurveTo(-0.55, 0.35, -0.48, -0.4, 0, -0.75);

    const leafExtrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };
    const leafGeo = new THREE.ExtrudeGeometry(leafShape, leafExtrudeSettings);
    const leafMat = new THREE.MeshPhysicalMaterial({
      color: COLOR_SAGE_DEEP,
      roughness: 0.32,
      metalness: 0.08,
      transmission: 0.42,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(1.22, 0.72, -0.2);
    leaf.rotation.set(0.3, 0.4, -0.45);
    leaf.scale.set(0.85, 0.85, 0.85);
    masterGroup.add(leaf);

    // G. Soft Atmospheric Drifting Particle Cloud
    const particleCount = 55;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 4.6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      particleSpeeds[i] = 0.003 + Math.random() * 0.005;
      particleOffsets[i] = Math.random() * Math.PI * 2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: COLOR_GOLDEN_WARMTH,
      size: 0.042,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // ─── 4. Atmosphere Lighting ─────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.15);
    scene.add(ambientLight);

    const sageKeyLight = new THREE.DirectionalLight(COLOR_SAGE_LIGHT, 2.2);
    sageKeyLight.position.set(3.8, 4.5, 3.8);
    scene.add(sageKeyLight);

    const ivoryRimLight = new THREE.DirectionalLight(COLOR_IVORY_WARM, 1.6);
    ivoryRimLight.position.set(-3.5, -2.5, -2.8);
    scene.add(ivoryRimLight);

    const centralBreathingLight = new THREE.PointLight(COLOR_SAGE_MID, 1.8, 6);
    centralBreathingLight.position.set(0, 0, 0.8);
    scene.add(centralBreathingLight);

    // ─── 5. Living Motion, Interactivity & Smoothing ────────────────────────
    let targetRotX = 0;
    let targetRotY = 0;
    let targetCamX = 0;
    let targetCamY = 0;
    let clickImpulse = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = normX * 0.45;
      targetRotX = -normY * 0.38;
      targetCamX = normX * 0.28;
      targetCamY = normY * 0.22;
    };

    const handleClick = () => {
      // Gentle pulse on click without interfering with inputs
      clickImpulse = 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('click', handleClick);

    // Visibility API handling: Pause rendering when the browser tab is hidden
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ─── 6. Render Loop ─────────────────────────────────────────────────────
    let animationFrameId: number;
    const startTime = performance.now();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isTabVisible) return;

      const elapsed = (performance.now() - startTime) / 1000;

      // Continuous subtle living drift
      const floatOffsetY = Math.sin(elapsed * 0.7) * 0.11;
      const satelliteOrbitTime = elapsed * 0.35;
      const dewdropOrbitTime = elapsed * -0.42;

      // Primary Glass Orb rotation & breathing
      mainOrb.rotation.y += 0.004;
      mainOrb.rotation.x = Math.sin(elapsed * 0.5) * 0.08;
      mainOrb.position.y = floatOffsetY;

      // Inner Core gentle pulsation
      const coreScale = 1 + Math.sin(elapsed * 1.4) * 0.06;
      innerCore.scale.set(coreScale, coreScale, coreScale);

      // Ribbon continuous flowing motion
      const ribbonSpeed = 0.14 + clickImpulse * 0.4;
      ribbon.rotation.x = elapsed * ribbonSpeed * 0.8;
      ribbon.rotation.y = elapsed * ribbonSpeed;
      ribbon.rotation.z = Math.sin(elapsed * 0.4) * 0.2;
      ribbon.position.y = floatOffsetY * 0.7;

      // Satellite Orb orbit & drift
      satellite.position.x = -1.65 + Math.cos(satelliteOrbitTime) * 0.25;
      satellite.position.y = 0.95 + Math.sin(satelliteOrbitTime * 1.2) * 0.22;
      satellite.rotation.y += 0.008;

      // Dewdrop Orb floating
      dewdrop.position.x = 1.5 + Math.sin(dewdropOrbitTime) * 0.18;
      dewdrop.position.y = -1.05 + Math.cos(dewdropOrbitTime * 0.9) * 0.15;

      // Leaf form gentle botanical sway
      leaf.rotation.z = -0.45 + Math.sin(elapsed * 0.6) * 0.12;
      leaf.rotation.x = 0.3 + Math.cos(elapsed * 0.5) * 0.08;
      leaf.position.y = 0.72 + Math.sin(elapsed * 0.8 + 1) * 0.09;

      // Light breathing intensity
      centralBreathingLight.intensity = 1.6 + Math.sin(elapsed * 1.8) * 0.35 + clickImpulse;

      // Decay click pulse
      if (clickImpulse > 0.001) {
        clickImpulse *= 0.92;
      } else {
        clickImpulse = 0;
      }

      // Drift particle positions upward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const yIndex = i * 3 + 1;
        const xIndex = i * 3 + 0;
        positions[yIndex] += particleSpeeds[i];
        positions[xIndex] += Math.sin(elapsed * 0.8 + particleOffsets[i]) * 0.0012;

        if (positions[yIndex] > 2.4) {
          positions[yIndex] = -2.2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Mouse Parallax Smoothing (Spring Interpolation)
      if (isTouch) {
        // Autonomous organic Lissajous movement on touch devices
        masterGroup.rotation.y = Math.sin(elapsed * 0.35) * 0.15;
        masterGroup.rotation.x = Math.cos(elapsed * 0.28) * 0.12;
      } else {
        masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.045;
        masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.045;
        camera.position.x += (targetCamX - camera.position.x) * 0.035;
        camera.position.y += (targetCamY - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // ─── 7. Responsive Resizing ─────────────────────────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });

    resizeObserver.observe(container);

    // ─── 8. Complete Resource Disposal on Unmount ───────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();

      // Geometries
      mainOrbGeo.dispose();
      innerCoreGeo.dispose();
      ribbonGeo.dispose();
      satelliteGeo.dispose();
      dewdropGeo.dispose();
      leafGeo.dispose();
      particleGeo.dispose();

      // Materials
      mainOrbMat.dispose();
      innerCoreMat.dispose();
      ribbonMat.dispose();
      satelliteMat.dispose();
      dewdropMat.dispose();
      leafMat.dispose();
      particleMat.dispose();

      // Lights & Renderer
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isTouchDevice]);

  // Fallback if WebGL is disabled or prefers-reduced-motion is active
  if (!hasWebGL) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-[#718368]/30 via-[#EAF0E5]/80 to-[#F4E9DE]/60 blur-2xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-56 h-56 rounded-full border border-[#718368]/30 bg-white/40 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-[#718368]/15 border border-[#718368]/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#718368] text-white flex items-center justify-center shadow-md">
                <span className="text-xl">🌿</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
