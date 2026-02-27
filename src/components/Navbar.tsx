import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';
import { useCartStore, useLanguageStore } from '../store';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { language, toggleLanguage } = useLanguageStore();
  const cartIconRef = useRef<HTMLAnchorElement>(null);
  const setCartIconPosition = useCartStore((state) => state.setCartIconPosition);

  useEffect(() => {
    if (cartIconRef.current) {
      const updatePosition = () => {
        const rect = cartIconRef.current?.getBoundingClientRect();
        if (rect) {
          setCartIconPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        }
      };
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [setCartIconPosition]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex justify-between items-center text-white pointer-events-auto bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
        <Link to="/" className="text-xl md:text-2xl font-bold font-latin-title tracking-wider z-50">
          ALGERIAN HERITAGE
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center font-latin-body">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/showcase" className="hover:text-amber-400 transition-colors">Collection</Link>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 hover:text-amber-400 transition-colors uppercase"
          >
            <Globe size={20} />
            <span>{language}</span>
          </button>

          <Link to="/cart" className="relative hover:text-amber-400 transition-colors" ref={cartIconRef}>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-black font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden z-50">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 uppercase text-sm font-bold border border-white/30 px-2 py-1 rounded-full"
          >
            {language}
          </button>
          
          <Link to="/cart" className="relative hover:text-amber-400 transition-colors">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-black font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-neutral-900 z-[60] flex flex-col items-center justify-center gap-8 text-white font-latin-title text-2xl"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-amber-400">Home</Link>
            <Link to="/showcase" onClick={() => setIsOpen(false)} className="hover:text-amber-400">Collection</Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-amber-400">
              <ShoppingBag size={24} />
              <span>Cart ({cartCount})</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
