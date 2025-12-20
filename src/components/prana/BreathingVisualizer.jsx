import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BreathingVisualizer({ 
  audioData, 
  isRecording, 
  peaks = [],
  windowFeatures = [] 
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      if (!audioData || audioData.length === 0) {
        // Draw idle animation
        const time = Date.now() / 1000;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.lineWidth = 2;
        
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + time * 2) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw waveform
      const step = Math.ceil(audioData.length / width);
      
      // Background grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Waveform
      ctx.beginPath();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < width; i++) {
        const dataIndex = Math.floor(i * step);
        const value = audioData[dataIndex] || 0;
        const y = height / 2 + value * height * 2;
        
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Glow effect
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
      ctx.lineWidth = 6;
      ctx.filter = 'blur(4px)';
      
      for (let i = 0; i < width; i++) {
        const dataIndex = Math.floor(i * step);
        const value = audioData[dataIndex] || 0;
        const y = height / 2 + value * height * 2;
        
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      ctx.filter = 'none';

      // Draw peak markers
      if (peaks.length > 0) {
        ctx.fillStyle = '#10b981';
        peaks.forEach(peak => {
          const x = (peak.index / audioData.length) * width;
          ctx.beginPath();
          ctx.arc(x, height / 2 - peak.value * height * 2, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isRecording, peaks]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-2xl p-4 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="w-full h-[150px] rounded-xl"
        />
        
        {isRecording && (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-red-400 text-sm font-medium">Recording</span>
          </div>
        )}

        {/* Frequency bars preview */}
        {windowFeatures.length > 0 && (
          <div className="flex items-end gap-1 h-12 mt-3 px-2">
            {windowFeatures.slice(-20).map((w, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: Math.min(48, w.rms * 500) }}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t"
                style={{ opacity: 0.5 + (i / 40) }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}