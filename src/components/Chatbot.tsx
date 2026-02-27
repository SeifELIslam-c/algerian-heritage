import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Mic, Send, Minimize2, Loader2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { products } from '../data/products';
import { useLanguageStore } from '../store';

// --- Audio Utils ---

// Convert Float32Array to Int16Array (PCM 16bit)
function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// Base64 encoding for ArrayBuffer
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Simple Audio Queue for playback
class AudioQueue {
  private audioContext: AudioContext;
  private queue: Float32Array[] = [];
  private nextStartTime = 0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  add(pcmData: Int16Array) {
    // Convert Int16 to Float32
    const float32 = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32[i] = pcmData[i] / 32768;
    }
    this.queue.push(float32);
    this.playNext();
  }

  private playNext() {
    if (this.queue.length === 0) {
        if (this.audioContext.currentTime > this.nextStartTime) {
            this.nextStartTime = this.audioContext.currentTime;
        }
        return;
    }
    
    if (this.nextStartTime < this.audioContext.currentTime) {
        this.nextStartTime = this.audioContext.currentTime;
    }

    const bufferData = this.queue.shift()!;
    const buffer = this.audioContext.createBuffer(1, bufferData.length, 24000); 
    buffer.getChannelData(0).set(bufferData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(this.nextStartTime);
    
    this.nextStartTime += buffer.duration;
    
    setTimeout(() => this.playNext(), 0);
  }
  
  clear() {
      this.queue = [];
      this.nextStartTime = 0;
  }
}

// --- Chatbot Component ---

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0); 

  const { language } = useLanguageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Refs for Voice Mode
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); 
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // ✅ التصحيح هنا: استخدام import.meta.env بدلاً من process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // تهيئة الـ AI فقط إذا كان المفتاح موجوداً لتجنب الـ Crash
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  useEffect(() => {
    // طباعة خطأ في الكونسول إذا لم يتم العثور على المفتاح
    if (!apiKey && isOpen) {
      console.error("خطأ: المفتاح مفقود! تأكد من وجود VITE_GEMINI_API_KEY في ملف .env");
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "System Error: API Key is missing. Please check configuration." 
      }]);
    }
  }, [apiKey, isOpen]);

  const systemInstruction = `
    You are a helpful and friendly AI assistant for "Algerian Heritage", an e-commerce store selling traditional Algerian clothing.
    
    Here is the list of products we sell:
    ${products.map(p => `
      - Name: ${p.name.en} (Arabic: ${p.name.ar}, French: ${p.name.fr})
      - Price: ${p.price} DZD
      - Description: ${p.description.en}
      - Sizes: ${p.sizes.join(', ')}
    `).join('\n')}

    Your goal is to answer customer questions about our products, prices, sizes, and heritage.
    Be polite, concise, and helpful.
    If asked about delivery, say we deliver to all 58 wilayas of Algeria.
    If asked about payment, say we accept cash on delivery.
    
    Respond in the language the user speaks (English, Arabic, or French).
    Current app language setting is: ${language}.
  `;

  // --- Text Chat Logic ---
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!ai) {
      alert("API Key is missing!");
      return;
    }

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: userMessage });
      const response = result.text;

      setMessages(prev => [...prev, { role: 'model', text: response || "I'm not sure how to respond to that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Chat Logic ---
  const startVoiceMode = async () => {
    if (!ai) {
       alert("API Key is missing. Cannot start voice mode.");
       return;
    }
    
    setIsVoiceMode(true);
    
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = ctx;
        audioQueueRef.current = new AudioQueue(ctx);

        const session = await ai.live.connect({
            model: "gemini-2.5-flash-native-audio-preview-09-2025",
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
                },
                systemInstruction: systemInstruction,
            },
            callbacks: {
                onopen: () => console.log("Live API Connected"),
                onmessage: async (msg: LiveServerMessage) => {
                    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        const binaryString = window.atob(base64Audio);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const pcmData = new Int16Array(bytes.buffer);
                        audioQueueRef.current?.add(pcmData);
                        
                        setAudioVolume(Math.random() * 0.8 + 0.2);
                        setTimeout(() => setAudioVolume(0), 200);
                    }
                },
                onclose: () => {
                    console.log("Live API Closed");
                    stopVoiceMode();
                },
                onerror: (err) => {
                    console.error("Live API Error:", err);
                    stopVoiceMode();
                }
            }
        });
        sessionRef.current = session;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 16000,
        }});
        streamRef.current = stream;
        
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            setAudioVolume(rms * 5); 

            const pcm16 = floatTo16BitPCM(inputData);
            const base64Data = arrayBufferToBase64(pcm16.buffer);
            
            session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                }
            });
        };

        source.connect(processor);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        processor.connect(gain);
        gain.connect(ctx.destination);

    } catch (err) {
        console.error("Failed to start voice mode:", err);
        stopVoiceMode();
    }
  };

  const stopVoiceMode = () => {
    setIsVoiceMode(false);
    setAudioVolume(0);

    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    audioQueueRef.current?.clear();
  };

  return (
    <>
      <motion.button
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 p-4 bg-amber-400 text-black rounded-full shadow-lg hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-24 md:right-6 z-50 md:w-96 h-[60vh] md:h-[500px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-latin-body"
          >
            <div className="p-4 bg-neutral-800 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {language === 'ar' ? 'المساعد الذكي' : (language === 'fr' ? 'Assistant IA' : 'AI Assistant')}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                <Minimize2 size={18} />
              </button>
            </div>

            {isVoiceMode ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/50 relative overflow-hidden">
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    <motion.div 
                        className="absolute inset-0 bg-amber-400/20 rounded-full"
                        animate={{ scale: 1 + audioVolume }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.div 
                        className="absolute inset-4 bg-amber-400/40 rounded-full"
                        animate={{ scale: 1 + audioVolume * 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <div className="relative z-10 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        <Mic size={32} className="text-black" />
                    </div>
                </div>
                
                <p className="text-white/80 text-center mb-8 animate-pulse">
                    {language === 'ar' ? 'جاري الاستماع...' : (language === 'fr' ? 'Écoute...' : 'Listening...')}
                </p>

                <button 
                    onClick={stopVoiceMode}
                    className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                    <VolumeX size={18} />
                    {language === 'ar' ? 'إنهاء المحادثة الصوتية' : (language === 'fr' ? 'Arrêter' : 'End Voice Chat')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-white/40 mt-12">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>{language === 'ar' ? 'كيف يمكنني مساعدتك اليوم؟' : (language === 'fr' ? 'Comment puis-je vous aider ?' : 'How can I help you today?')}</p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-amber-400 text-black rounded-tr-none' 
                          : 'bg-neutral-800 text-white rounded-tl-none border border-white/10'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-800 p-3 rounded-2xl rounded-tl-none border border-white/10">
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-neutral-800 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={startVoiceMode}
                    className="p-3 bg-neutral-700 text-amber-400 rounded-full hover:bg-neutral-600 transition-colors"
                    title="Voice Chat"
                  >
                    <Mic size={20} />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={language === 'ar' ? 'اكتب رسالتك...' : (language === 'fr' ? 'Écrivez votre message...' : 'Type your message...')}
                    className={`flex-1 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-amber-400 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-3 bg-amber-400 text-black rounded-full hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}