import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion as motion3d } from 'framer-motion-3d';

interface ModelProps {
  path: string;
  isActive: boolean;
  color: string;
}

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Model loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GLTFModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        const material = (child as THREE.Mesh).material;

        // دالة لضبط المادة دون تغيير لونها الأصلي
        const fixMaterial = (mat: THREE.Material) => {
           const m = mat as THREE.MeshStandardMaterial;
           
           // هام جداً: لا نغير m.color أبداً لنحافظ على التكستشر الأصلي
           
           // 1. القماش لا يجب أن يكون معدنياً (يحل مشكلة السواد)
           m.metalness = 0; 
           
           // 2. خشونة متوسطة لواقعية القماش
           m.roughness = 0.5;

           // 3. تصحيح ألوان التكستشر (إذا وجد) ليكون ساطعاً
           if (m.map) {
             m.map.colorSpace = THREE.SRGBColorSpace;
             m.map.needsUpdate = true;
           }
           
           // تحديث المادة
           m.needsUpdate = true;
        };

        if (material) {
           if (Array.isArray(material)) {
             material.forEach(m => fixMaterial(m));
           } else {
             fixMaterial(material);
           }
        }
      }
    });
  }, [scene]);

  return (
    <group>
      {/* 
        البيئة ضرورية جداً لإظهار الخامات (بدونها يظهر الموديل مسطحاً)
        preset="city" تعطي إضاءة محايدة ممتازة للتفاصيل
      */}
      <Environment preset="city" />
      
      {/* الموديل الأصلي دون أي تعديلات خارجية */}
      <primitive object={scene} scale={2} position={[0, -1.2, 0]} />
    </group>
  );
}

export function Model({ path, isActive, color: _color }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  
  const speedRef = useRef(0);
  const targetSpeed = 0.5; 
  const entrySpeed = 10; 

  useEffect(() => {
    if (isActive) {
      speedRef.current = entrySpeed;
    }
  }, [isActive]);

  useFrame((_, delta) => {
    if (group.current) {
      speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, delta * 2);
      group.current.rotation.y += delta * speedRef.current;
    }
  });

  return (
    <motion3d.group
      initial={{ scale: 0.001, y: -1 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.001, y: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <group ref={group}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <GLTFModel path={path} />
            </Suspense>
          </ErrorBoundary>
        </Float>
      </group>
    </motion3d.group>
  );
}