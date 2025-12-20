import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Loader2, Wind, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BreathingVisualizer from './BreathingVisualizer';
import { CircularBuffer } from './AudioProcessor';

const SAMPLE_RATE = 16000;
const RECORD_DURATION = 8; // seconds

export default function RecordingInterface({ onAnalysisComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioData, setAudioData] = useState(null);
  const [status, setStatus] = useState('idle');
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const circularBufferRef = useRef(new CircularBuffer(SAMPLE_RATE * RECORD_DURATION));
  const chunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const visualize = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(dataArray);
    
    // Push to circular buffer
    circularBufferRef.current.pushArray(dataArray);
    setAudioData(circularBufferRef.current.toArray());
    
    // Update progress
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setProgress(Math.min(100, (elapsed / RECORD_DURATION) * 100));
    }
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(visualize);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setStatus('requesting');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: SAMPLE_RATE
      });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      chunksRef.current = [];
      circularBufferRef.current.clear();
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        setIsProcessing(true);
        setStatus('processing');
        
        // Convert recorded audio to raw samples
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioBuffer = await audioBlob.arrayBuffer();
        
        try {
          const decodedAudio = await audioContextRef.current.decodeAudioData(audioBuffer);
          const rawData = decodedAudio.getChannelData(0);
          
          // Resample if needed
          const resampledData = resampleAudio(rawData, decodedAudio.sampleRate, SAMPLE_RATE);
          
          setAudioData(resampledData);
          onAnalysisComplete(resampledData, SAMPLE_RATE);
        } catch (err) {
          console.error('Audio processing error:', err);
          // Use circular buffer data as fallback
          onAnalysisComplete(circularBufferRef.current.toArray(), SAMPLE_RATE);
        }
        
        setIsProcessing(false);
        setStatus('complete');
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setStatus('recording');
      setProgress(0);
      startTimeRef.current = Date.now();
      
      visualize();

      // Auto-stop after duration
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, RECORD_DURATION * 1000);

    } catch (err) {
      console.error('Microphone access error:', err);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Simple resampling function
  const resampleAudio = (audioData, fromRate, toRate) => {
    if (fromRate === toRate) return audioData;
    
    const ratio = fromRate / toRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
      const t = srcIndex - srcIndexFloor;
      
      result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
    }
    
    return result;
  };

  return (
    <div className="space-y-6">
      <BreathingVisualizer 
        audioData={audioData} 
        isRecording={isRecording}
      />

      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
        <div className="text-center space-y-6">
          {/* Status indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2"
            >
              {status === 'idle' && (
                <>
                  <Wind className="w-5 h-5 text-cyan-500" />
                  <span className="text-slate-600">Ready to analyze your breathing</span>
                </>
              )}
              {status === 'requesting' && (
                <>
                  <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                  <span className="text-slate-600">Requesting microphone access...</span>
                </>
              )}
              {status === 'recording' && (
                <>
                  <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                  <span className="text-slate-600">Breathe naturally into your device</span>
                </>
              )}
              {status === 'processing' && (
                <>
                  <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                  <span className="text-slate-600">Analyzing breathing patterns...</span>
                </>
              )}
              {status === 'complete' && (
                <>
                  <Activity className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Analysis complete!</span>
                </>
              )}
              {status === 'error' && (
                <span className="text-red-500">Could not access microphone. Please allow permissions.</span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          {(isRecording || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="space-y-2"
            >
              <Progress value={isProcessing ? 100 : progress} className="h-2" />
              <p className="text-sm text-slate-500">
                {isProcessing ? 'Processing...' : `${Math.round(progress)}% recorded`}
              </p>
            </motion.div>
          )}

          {/* Recording button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!isRecording && !isProcessing ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 px-8 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
              >
                <Mic className="w-6 h-6 mr-3" />
                Start Breathing Analysis
              </Button>
            ) : isRecording ? (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="h-16 px-8 text-lg shadow-lg"
              >
                <Square className="w-5 h-5 mr-3" />
                Stop Recording
              </Button>
            ) : (
              <Button disabled size="lg" className="h-16 px-8 text-lg">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Analyzing...
              </Button>
            )}
          </motion.div>

          {/* Instructions */}
          <div className="text-sm text-slate-500 space-y-1">
            <p>Hold your device 6-12 inches from your mouth</p>
            <p>Breathe naturally for {RECORD_DURATION} seconds</p>
          </div>
        </div>
      </Card>
    </div>
  );
}