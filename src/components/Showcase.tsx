import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Preload, OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { products } from '../data/products';
import { Model } from './Model';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguageStore } from '../store';

export default function Showcase() {
  const container = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();

  return (
    <div ref={container} className="relative w-full h-screen overflow-y-auto bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-latin-title text-center mb-16 text-amber-400"
        >
          {language === 'ar' ? 'المجموعة' : (language === 'fr' ? 'La Collection' : 'The Collection')}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-colors flex flex-col"
            >
              <Link to={`/product/${product.id}`} className="block h-full flex flex-col">
                {/* 3D View Container - Top Half */}
                <div className="h-[300px] w-full relative bg-gradient-to-b from-white/5 to-transparent pointer-events-none">
                  <View className="absolute inset-0 w-full h-full">
                    <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={40} />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} intensity={1} />
                    <Environment preset="city" />
                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                      <Model path={product.modelPath} isActive={true} color={product.textColor} />
                    </Float>
                    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={1} />
                  </View>
                </div>
                
                {/* Text Content - Bottom Half */}
                <div className="p-6 flex-grow bg-neutral-800/50 backdrop-blur-sm z-10 relative">
                  <h3 className={`text-2xl font-bold mb-2 text-amber-100 ${language === 'ar' ? 'font-arabic-title text-right' : 'font-latin-title'}`}>
                    {product.name[language]}
                  </h3>
                  <p className={`text-sm text-gray-300 line-clamp-2 mb-4 ${language === 'ar' ? 'font-arabic-body text-right' : 'font-latin-body'}`}>
                    {product.description[language]}
                  </p>
                  <div className={`flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between mt-auto`}>
                    <span className="text-amber-400 font-bold">{product.price.toLocaleString()} DZD</span>
                    <span className="text-xs uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full group-hover:bg-amber-400 group-hover:text-black transition-colors">
                      {language === 'ar' ? 'التفاصيل' : (language === 'fr' ? 'Détails' : 'View Details')}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shared Canvas for all Views */}
      <Canvas
        className="fixed inset-0 pointer-events-none"
        eventSource={container as any}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <View.Port />
        <Preload all />
      </Canvas>
    </div>
  );
}
