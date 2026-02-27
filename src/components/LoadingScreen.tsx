import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [text, setText] = useState('');
  const fullText = "ALGERIAN HERITAGE";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  useEffect(() => {
    // Text scramble effect
    let iteration = 0;
    const interval = setInterval(() => {
      setText(fullText
        .split("")
        .map((_, index) => {
          if (index < iteration) {
            return fullText[index];
          }
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("")
      );

      if (iteration >= fullText.length) {
        clearInterval(interval);
        setTimeout(onComplete, 500); // Finish shortly after text completes
      }

      iteration += 1 / 3;
    }, 50); // Slightly slower for dramatic effect

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#1c1c1c] text-white flex flex-col items-center justify-center overflow-hidden font-mono"
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Background Lines */}
      <div className="absolute inset-0 w-full h-full flex justify-between px-4 md:px-20 pointer-events-none opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-px bg-white h-full"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        
        {/* Scramble Title - Massive */}
        <div className="overflow-hidden">
             <h1 className="text-4xl md:text-7xl lg:text-9xl font-bold tracking-widest text-center text-[#dbdbdb] mix-blend-difference">
              {text}
            </h1>
        </div>
        
        {/* Decorative Bar */}
        <motion.div 
            className="w-24 h-1 bg-amber-500 mt-8"
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        />

      </div>
    </motion.div>
  );
}
