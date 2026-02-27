import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProductSlider from './components/ProductSlider';
import Showcase from './components/Showcase';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import LoadingScreen from './components/LoadingScreen';
import Chatbot from './components/Chatbot';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <Navbar />
      <Routes>
        <Route path="/" element={<ProductSlider />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      
      {!isLoading && <Chatbot />}
    </Router>
  );
}
