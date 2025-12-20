import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wind, 
  Activity, 
  BookOpen, 
  Heart,
  Shield,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import RecordingInterface from '@/components/prana/RecordingInterface';
import HealthReport from '@/components/prana/HealthReport';
import DSAExplainer from '@/components/prana/DSAExplainer';
import DebugPanel from '@/components/prana/DebugPanel';
import { analyzeBreathing } from '@/components/prana/AudioProcessor';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleAnalysisComplete = (audioData, sampleRate) => {
    const result = analyzeBreathing(audioData, sampleRate);
    setAnalysisResult(result);
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30"
              >
                <Wind className="w-9 h-9 text-white" />
              </motion.div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  PRANA
                </h1>
                <p className="text-cyan-300 text-sm font-medium tracking-wide">
                  Pulmonary Respiration Analysis
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-6">
              Advanced breathing pattern analysis using signal processing algorithms. 
              Get instant insights about your respiratory health.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                <Activity className="w-3 h-3 mr-1" />
                Real-time Analysis
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                DSA-Powered
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Privacy-First
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 50L48 45.7C96 41 192 33 288 35.3C384 37 480 50 576 55C672 60 768 57 864 50C960 43 1056 33 1152 35.3C1248 37 1344 50 1392 57.3L1440 65V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="720" y1="0" x2="720" y2="100">
                <stop stopColor="#f8fafc" stopOpacity="0"/>
                <stop offset="1" stopColor="#f8fafc"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 -mt-4 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="analyze" 
              className="h-12 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              Analyze Breathing
            </TabsTrigger>
            <TabsTrigger 
              value="learn"
              className="h-12 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              How It Works
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <AnimatePresence mode="wait">
              {!analysisResult ? (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RecordingInterface onAnalysisComplete={handleAnalysisComplete} />
                  
                  {/* Quick Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <button
                      onClick={() => setShowHowItWorks(!showHowItWorks)}
                      className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="text-slate-600 font-medium">What happens during analysis?</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showHowItWorks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-slate-50 rounded-b-xl border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <ProcessStep
                                number="1"
                                title="Audio Capture"
                                description="Microphone records 8 seconds of breathing"
                              />
                              <ProcessStep
                                number="2"
                                title="Signal Processing"
                                description="FFT, ZCR, and energy analysis extract features"
                              />
                              <ProcessStep
                                number="3"
                                title="Classification"
                                description="Threshold-based logic determines breathing status"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <HealthReport analysisResult={analysisResult} />
                  
                  <DebugPanel analysisResult={analysisResult} />
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={resetAnalysis}
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      <Activity className="w-5 h-5 mr-2" />
                      Analyze Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="learn">
            <DSAExplainer />
            
            {/* Processing Pipeline */}
            <Card className="mt-6 border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  Processing Pipeline
                </h3>
                <div className="relative">
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-emerald-500"></div>
                  <div className="space-y-6 relative">
                    <PipelineStep
                      number="1"
                      title="Audio Acquisition"
                      items={[
                        "Capture via Circular Buffer (Queue)",
                        "16kHz sample rate, mono channel",
                        "Noise removal via threshold filtering"
                      ]}
                      color="cyan"
                    />
                    <PipelineStep
                      number="2"
                      title="Feature Extraction"
                      items={[
                        "Sliding Window analysis (500ms, 50% overlap)",
                        "Energy, RMS, ZCR per frame",
                        "FFT for frequency spectrum",
                        "Store in Feature HashMap"
                      ]}
                      color="purple"
                    />
                    <PipelineStep
                      number="3"
                      title="Classification"
                      items={[
                        "Threshold-based decision logic",
                        "Peak detection for breathing rate",
                        "Abnormality ranking via Priority Queue",
                        "Confidence score calculation"
                      ]}
                      color="emerald"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-white">PRANA v0.1</span>
          </div>
          <p className="text-sm max-w-lg mx-auto mb-4">
            This is a screening and assistive tool for educational purposes. 
            It is not a medical diagnostic device and should not replace professional medical advice.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              Built with DSA principles
            </span>
            <span>•</span>
            <span>For academic evaluation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">
        {number}
      </div>
      <h4 className="font-medium text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

function PipelineStep({ number, title, items, color }) {
  const colorClasses = {
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <div className="flex gap-4">
      <div className={`w-12 h-12 ${colorClasses[color]} text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0`}>
        {number}
      </div>
      <div className="flex-1 bg-slate-50 rounded-xl p-4">
        <h4 className="font-semibold text-slate-800 mb-2">{title}</h4>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-slate-400 mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}