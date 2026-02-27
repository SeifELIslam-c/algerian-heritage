import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { motion as motion3d } from 'framer-motion-3d';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { Model } from './Model';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../store';
import PageTransition from './PageTransition';

export default function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguageStore();
  const [direction, setDirection] = useState(0);

  const currentProduct = products[currentIndex];

  const nextProduct = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Determine text direction and font based on language
  const isArabic = language === 'ar';
  const titleFont = isArabic ? 'font-arabic-title' : 'font-latin-title';
  const bodyFont = isArabic ? 'font-arabic-body' : 'font-latin-body';

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 5 : -5,
      scale: 0.8,
      rotateY: direction > 0 ? Math.PI / 4 : -Math.PI / 4,
    }),
    center: {
      x: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 5 : -5,
      scale: 0.8,
      rotateY: direction < 0 ? Math.PI / 4 : -Math.PI / 4,
      transition: {
        duration: 0.5,
      }
    })
  };

  const MotionGroup = motion3d.group as any;

  return (
    <PageTransition>
      <div 
        className="relative w-full h-screen overflow-hidden transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: currentProduct.backgroundColor }}
      >
        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            
            <AnimatePresence custom={direction} mode='wait'>
              <MotionGroup 
                key={currentProduct.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                 <Model 
                   path={currentProduct.modelPath} 
                   isActive={true} 
                   color={currentProduct.textColor}
                 />
              </MotionGroup>
            </AnimatePresence>
            
            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} />
          </Canvas>
        </div>

        {/* UI Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-16 pt-24 md:pt-32">
          
          {/* Product Info */}
          <main className="flex flex-col items-start max-w-xl w-full pointer-events-auto" dir="ltr">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-4 items-start text-left w-full"
                style={{ direction: 'ltr', textAlign: 'left' }}
              >
                <h2 
                  className={`text-5xl md:text-7xl font-bold leading-tight ${titleFont} text-left`}
                  style={{ color: currentProduct.textColor, direction: 'ltr', textAlign: 'left' }}
                >
                  {currentProduct.name[language]}
                </h2>
                <div 
                  className={`h-1 w-24 rounded-full my-4`}
                  style={{ backgroundColor: currentProduct.accentColor }}
                />
                <p 
                  className={`text-lg md:text-xl leading-relaxed opacity-90 max-w-lg ${bodyFont} text-left`}
                  style={{ color: currentProduct.textColor, direction: 'ltr', textAlign: 'left' }}
                >
                  {currentProduct.description[language]}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-8 w-full justify-start items-center flex-row" dir="ltr">
                  <Link 
                    to={`/product/${currentProduct.id}`}
                    className={`px-8 py-3 rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95 ${titleFont}`}
                    style={{ 
                      backgroundColor: currentProduct.textColor, 
                      color: currentProduct.backgroundColor 
                    }}
                  >
                    {isArabic ? 'اكتشف المزيد' : (language === 'fr' ? 'Découvrir' : 'Discover')}
                  </Link>
                  
                  <Link
                    to="/showcase"
                    className={`px-8 py-3 rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95 border-2 ${titleFont}`}
                    style={{ 
                      borderColor: currentProduct.textColor, 
                      color: currentProduct.textColor 
                    }}
                  >
                    {isArabic ? 'المجموعة الكاملة' : (language === 'fr' ? 'Collection' : 'View Collection')}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Navigation */}
          <footer className="flex justify-between items-end pointer-events-auto">
            <div className="flex gap-4">
               {/* Pagination dots */}
               <div className="flex gap-2 items-center">
                  {products.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8' : ''}`}
                      style={{ backgroundColor: currentProduct.textColor, opacity: idx === currentIndex ? 1 : 0.5 }}
                    />
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevProduct}
                className="p-4 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all border border-white/20 group"
                style={{ color: currentProduct.textColor }}
                aria-label="Previous Product"
              >
                <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={nextProduct}
                className="p-4 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all border border-white/20 group"
                style={{ color: currentProduct.textColor }}
                aria-label="Next Product"
              >
                <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}
