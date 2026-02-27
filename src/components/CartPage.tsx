import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore, useLanguageStore } from '../store';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

export default function CartPage() {
  const { items, removeFromCart, total } = useCartStore();
  const { language } = useLanguageStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false);
      alert(language === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Order received successfully!');
      useCartStore.getState().clearCart();
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-neutral-900 text-white font-latin-body pt-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/showcase" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} />
            <span>{language === 'ar' ? 'العودة للتسوق' : 'Continue Shopping'}</span>
          </Link>

          <h1 className={`text-3xl md:text-5xl font-bold text-amber-400 mb-12 ${language === 'ar' ? 'text-right font-arabic-title' : 'font-latin-title'}`}>
            {language === 'ar' ? 'سلة المشتريات' : (language === 'fr' ? 'Panier' : 'Shopping Cart')}
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <ShoppingBag size={64} className="mx-auto text-white/20 mb-6" />
              <p className="text-xl text-white/50 mb-8">
                {language === 'ar' ? 'سلتك فارغة' : 'Your cart is empty'}
              </p>
              <Link 
                to="/showcase" 
                className="inline-block px-8 py-3 bg-amber-400 text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                {language === 'ar' ? 'تصفح المجموعة' : 'Browse Collection'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.selectedSize}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 items-center"
                    >
                      <div className="w-20 h-20 bg-white/10 rounded-lg overflow-hidden shrink-0">
                        <img src={item.images[0]} alt={item.name[language]} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className={`font-bold text-lg ${language === 'ar' ? 'font-arabic-title' : ''}`}>
                          {item.name[language]}
                        </h3>
                        <p className="text-sm text-white/50">Size: {item.selectedSize}</p>
                        <p className="text-amber-400 font-medium mt-1">{item.price.toLocaleString()} DZD</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm bg-white/10 px-2 py-1 rounded">Qty: {item.quantity}</span>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sticky top-24">
                  <h2 className={`text-xl font-bold mb-6 ${language === 'ar' ? 'text-right font-arabic-title' : ''}`}>
                    {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-white/70">
                      <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span>{total().toLocaleString()} DZD</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                      <span>{language === 'ar' ? 'مجاني' : 'Free'}</span>
                    </div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between text-xl font-bold text-amber-400">
                      <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span>{total().toLocaleString()} DZD</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut 
                      ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') 
                      : (language === 'ar' ? 'إتمام الطلب' : 'Checkout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
