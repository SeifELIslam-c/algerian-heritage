import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../data/products';
import { Model } from './Model';
import { useCartStore, useLanguageStore } from '../store';
import { ChevronLeft, ChevronRight, Camera, Box, ArrowLeft } from 'lucide-react';

export default function ProductPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'images'>('3d');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const addToCart = useCartStore(state => state.addToCart);
  const { language } = useLanguageStore();
  const { cartIconPosition } = useCartStore();
  const [glowingLine, setGlowingLine] = useState<{id: number, startX: number, startY: number, endX: number, endY: number} | null>(null);

  if (!product) return <div>Product not found</div>;

  const nextImage = () => {
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!selectedSize) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = cartIconPosition?.x || window.innerWidth - 40;
    const endY = cartIconPosition?.y || 40;

    setGlowingLine({ id: Date.now(), startX, startY, endX, endY });
    
    // Add to cart after animation
    setTimeout(() => {
        addToCart(product, selectedSize);
        setGlowingLine(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-latin-body pt-4 lg:pt-20">
      {/* Glowing Line Animation */}
      <AnimatePresence>
        {glowingLine && (
            <svg className="fixed inset-0 z-[100] pointer-events-none w-full h-full">
                <motion.path
                    d={`M ${glowingLine.startX} ${glowingLine.startY} Q ${(glowingLine.startX + glowingLine.endX) / 2} ${glowingLine.startY - 100} ${glowingLine.endX} ${glowingLine.endY}`}
                    fill="none"
                    stroke="#fbbf24" // amber-400
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                <motion.circle
                    cx={glowingLine.endX}
                    cy={glowingLine.endY}
                    r="0"
                    fill="#fbbf24"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 20, opacity: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                />
            </svg>
        )}
      </AnimatePresence>

      <div className="px-4 py-4 lg:absolute lg:top-24 lg:left-8 lg:z-30 lg:p-0">
        <Link to="/showcase" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
          <ArrowLeft size={20} /> <span className="hidden md:inline">{language === 'ar' ? 'العودة للمجموعة' : (language === 'fr' ? 'Retour à la collection' : 'Back to Collection')}</span>
        </Link>
      </div>

      {/* Mobile Title & Price */}
      <div className="lg:hidden px-6 pb-4 text-center">
        <h1 className={`text-3xl font-bold text-amber-400 mb-2 ${language === 'ar' ? 'font-arabic-title' : 'font-latin-title'}`}>
          {product.name[language]}
        </h1>
        <p className="text-xl text-white/80 font-light">{product.price.toLocaleString()} DZD</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[calc(100vh-80px)] pb-24 lg:pb-0 gap-4 lg:gap-0">
        {/* Left: Visuals - Cylinder Shape */}
        <div className="relative h-[45vh] lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 bg-neutral-800 overflow-hidden shrink-0 mx-4 lg:mx-8 rounded-[2.5rem] shadow-2xl border border-white/5">
          {/* View Mode Toggle */}
          <div className="absolute top-4 right-4 z-20 flex gap-2 bg-black/50 backdrop-blur-md p-1 rounded-full">
            <button
              onClick={() => setViewMode('3d')}
              className={`p-2 rounded-full transition-all ${viewMode === '3d' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
            >
              <Box size={20} />
            </button>
            <button
              onClick={() => setViewMode('images')}
              className={`p-2 rounded-full transition-all ${viewMode === 'images' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
            >
              <Camera size={20} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === '3d' ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                  <Environment preset="city" />
                  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Model path={product.modelPath} isActive={true} color={product.textColor} />
                  </Float>
                  <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
                  <OrbitControls enableZoom={false} />
                </Canvas>
              </motion.div>
            ) : (
              <motion.div
                key="images"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative overflow-hidden"
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={currentImageIndex}
                    src={product.images[currentImageIndex]}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);

                      if (swipe < -swipeConfidenceThreshold) {
                        nextImage();
                      } else if (swipe > swipeConfidenceThreshold) {
                        prevImage();
                      }
                    }}
                    className="absolute w-full h-full object-cover"
                    alt={product.name.en} 
                  />
                </AnimatePresence>
                
                {/* Image Navigation */}
                <div className="absolute inset-0 flex items-center justify-between p-4 z-10 pointer-events-none">
                  <button onClick={prevImage} className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors pointer-events-auto backdrop-blur-sm">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextImage} className="p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors pointer-events-auto backdrop-blur-sm">
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {product.images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentImageIndex ? 1 : -1);
                        setCurrentImageIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Details */}
        <div className="flex-grow flex flex-col lg:justify-center bg-neutral-900 relative">
          <div className="p-6 lg:p-24 pb-32 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <h1 className={`hidden lg:block text-3xl lg:text-5xl font-bold text-amber-400 mb-4 mt-8 lg:mt-0 ${language === 'ar' ? 'font-arabic-title' : 'font-latin-title'}`}>
                {product.name[language]}
              </h1>
              <p className="hidden lg:block text-2xl text-white/80 mb-8 font-light">{product.price.toLocaleString()} DZD</p>
              
              <div className="flex flex-col lg:block">
                {/* Sizes - Order 1 on mobile to show first */}
                <div className="order-1 lg:order-2 mb-8 lg:mb-12">
                  <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-4">
                    {language === 'ar' ? 'اختر المقاس' : (language === 'fr' ? 'Choisir la taille' : 'Select Size')}
                  </h3>
                  <div className={`flex gap-4 flex-wrap ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                          selectedSize === size 
                            ? 'bg-amber-400 border-amber-400 text-black font-bold' 
                            : 'border-white/20 text-white hover:border-white/50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description - Order 2 on mobile */}
                <div className="order-2 lg:order-1 prose prose-invert mb-12 max-w-none">
                  <p className={`text-lg text-gray-300 leading-relaxed ${language === 'ar' ? 'font-arabic-body' : 'font-latin-body'}`}>
                    {product.description[language]}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Add to Cart - Sticky on Mobile */}
          <div className="hidden lg:block mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full py-4 rounded-full text-lg font-bold tracking-wider transition-all relative overflow-hidden ${
                selectedSize 
                  ? 'bg-white text-black hover:bg-amber-400 hover:scale-[1.02]' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="relative z-10">
                {selectedSize 
                  ? (language === 'ar' ? 'أضف إلى السلة' : (language === 'fr' ? 'Ajouter au panier' : 'ADD TO CART'))
                  : (language === 'ar' ? 'اختر مقاساً' : (language === 'fr' ? 'Sélectionnez une taille' : 'SELECT A SIZE'))
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/90 backdrop-blur-md border-t border-white/10 lg:hidden z-50">
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className={`w-full py-4 rounded-full text-lg font-bold tracking-wider transition-all relative overflow-hidden ${
            selectedSize 
              ? 'bg-white text-black hover:bg-amber-400 hover:scale-[1.02]' 
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <span className="relative z-10">
            {selectedSize 
              ? (language === 'ar' ? 'أضف إلى السلة' : (language === 'fr' ? 'Ajouter au panier' : 'ADD TO CART'))
              : (language === 'ar' ? 'اختر مقاساً' : (language === 'fr' ? 'Sélectionnez une taille' : 'SELECT A SIZE'))
            }
          </span>
        </button>
      </div>
    </div>
  );
}
