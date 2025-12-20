import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  GitBranch, 
  Layers, 
  Activity,
  Zap,
  BarChart3,
  Waves,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const DATA_STRUCTURES = [
  {
    name: 'Circular Buffer (Queue)',
    icon: Database,
    purpose: 'Real-time audio streaming',
    description: 'A fixed-size buffer that overwrites oldest data when full. Used to maintain a rolling window of audio samples for continuous processing.',
    complexity: 'O(1) insertion, O(n) read',
    code: `class CircularBuffer {
  constructor(size) {
    this.buffer = new Float32Array(size);
    this.head = 0;
    this.tail = 0;
  }
  
  push(value) {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.size;
  }
}`
  },
  {
    name: 'Feature HashMap',
    icon: Layers,
    purpose: 'Feature storage & quick lookup',
    description: 'Stores extracted audio features (energy, RMS, ZCR, etc.) with O(1) access time. Enables efficient feature comparison and retrieval.',
    complexity: 'O(1) average access',
    code: `class FeatureMap {
  constructor() {
    this.features = new Map();
  }
  
  set(key, value) {
    this.features.set(key, value);
  }
  
  get(key) {
    return this.features.get(key);
  }
}`
  },
  {
    name: 'Priority Queue',
    icon: GitBranch,
    purpose: 'Abnormality severity ranking',
    description: 'Ranks detected abnormalities by severity score. Most severe issues are processed first for reporting.',
    complexity: 'O(n) insertion, O(1) peek',
    code: `class PriorityQueue {
  enqueue(element, priority) {
    // Insert maintaining priority order
    for (let i = 0; i < this.items.length; i++) {
      if (priority > this.items[i].priority) {
        this.items.splice(i, 0, { element, priority });
        return;
      }
    }
    this.items.push({ element, priority });
  }
}`
  }
];

const ALGORITHMS = [
  {
    name: 'Signal Energy Calculation',
    icon: Zap,
    purpose: 'Measure breathing intensity',
    description: 'Computes the average squared amplitude of the signal. Higher energy indicates louder/deeper breaths.',
    formula: 'E = (1/N) × Σ x[n]²',
    code: `function calculateEnergy(signal) {
  let energy = 0;
  for (let i = 0; i < signal.length; i++) {
    energy += signal[i] * signal[i];
  }
  return energy / signal.length;
}`
  },
  {
    name: 'Zero Crossing Rate (ZCR)',
    icon: Activity,
    purpose: 'Detect high-frequency components',
    description: 'Counts how often the signal crosses zero. High ZCR may indicate wheezing or noisy breathing.',
    formula: 'ZCR = (1/N) × Σ |sign(x[n]) - sign(x[n-1])|',
    code: `function calculateZCR(signal) {
  let crossings = 0;
  for (let i = 1; i < signal.length; i++) {
    if ((signal[i] >= 0 && signal[i-1] < 0) || 
        (signal[i] < 0 && signal[i-1] >= 0)) {
      crossings++;
    }
  }
  return crossings / (signal.length - 1);
}`
  },
  {
    name: 'Fast Fourier Transform (FFT)',
    icon: Waves,
    purpose: 'Frequency domain analysis',
    description: 'Converts time-domain audio to frequency spectrum. Identifies dominant breathing frequencies.',
    formula: 'X[k] = Σ x[n] × e^(-2πi×k×n/N)',
    code: `function fft(signal) {
  const magnitudes = [];
  for (let k = 0; k < N/2; k++) {
    let real = 0, imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }
    magnitudes[k] = Math.sqrt(real*real + imag*imag);
  }
  return magnitudes;
}`
  },
  {
    name: 'Peak Detection',
    icon: Target,
    purpose: 'Identify breathing cycles',
    description: 'Finds local maxima in the signal envelope to count individual breaths and measure breathing rate.',
    formula: 'Peak if: x[n] > x[n-1] AND x[n] > x[n+1] AND x[n] > threshold',
    code: `function detectPeaks(signal, threshold) {
  const peaks = [];
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i-1] && 
        signal[i] > signal[i+1] && 
        signal[i] > threshold) {
      peaks.push({ index: i, value: signal[i] });
    }
  }
  return peaks;
}`
  },
  {
    name: 'Sliding Window Analysis',
    icon: BarChart3,
    purpose: 'Frame-wise feature extraction',
    description: 'Processes audio in overlapping windows (50% overlap). Extracts features from each frame for temporal analysis.',
    formula: 'Window[i] = signal[i×hop : i×hop + windowSize]',
    code: `function slidingWindow(signal, windowSize, hopSize) {
  const windows = [];
  for (let start = 0; start < signal.length - windowSize; 
       start += hopSize) {
    const window = signal.slice(start, start + windowSize);
    windows.push({
      energy: calculateEnergy(window),
      zcr: calculateZCR(window),
      fft: fft(window)
    });
  }
  return windows;
}`
  }
];

export default function DSAExplainer() {
  const [selectedDS, setSelectedDS] = useState(0);
  const [selectedAlgo, setSelectedAlgo] = useState(0);

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          DSA Concepts in PRANA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="structures" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-slate-50">
            <TabsTrigger value="structures" className="flex-1">
              <Database className="w-4 h-4 mr-2" />
              Data Structures
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Algorithms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structures" className="p-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {DATA_STRUCTURES.map((ds, index) => (
                <Badge
                  key={index}
                  variant={selectedDS === index ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDS(index)}
                >
                  <ds.icon className="w-3 h-3 mr-1" />
                  {ds.name}
                </Badge>
              ))}
            </div>

            <motion.div
              key={selectedDS}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-4 space-y-4"
            >
              <div className="flex items-start gap-3">
                {React.createElement(DATA_STRUCTURES[selectedDS].icon, {
                  className: "w-8 h-8 text-indigo-500 flex-shrink-0"
                })}
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {DATA_STRUCTURES[selectedDS].name}
                  </h4>
                  <p className="text-sm text-indigo-600 font-medium">
                    {DATA_STRUCTURES[selectedDS].purpose}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                {DATA_STRUCTURES[selectedDS].description}
              </p>

              <Badge variant="secondary" className="font-mono text-xs">
                {DATA_STRUCTURES[selectedDS].complexity}
              </Badge>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{DATA_STRUCTURES[selectedDS].code}</code>
              </pre>
            </motion.div>
          </TabsContent>

          <TabsContent value="algorithms" className="p-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {ALGORITHMS.map((algo, index) => (
                <Badge
                  key={index}
                  variant={selectedAlgo === index ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedAlgo(index)}
                >
                  <algo.icon className="w-3 h-3 mr-1" />
                  {algo.name}
                </Badge>
              ))}
            </div>

            <motion.div
              key={selectedAlgo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-4 space-y-4"
            >
              <div className="flex items-start gap-3">
                {React.createElement(ALGORITHMS[selectedAlgo].icon, {
                  className: "w-8 h-8 text-purple-500 flex-shrink-0"
                })}
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {ALGORITHMS[selectedAlgo].name}
                  </h4>
                  <p className="text-sm text-purple-600 font-medium">
                    {ALGORITHMS[selectedAlgo].purpose}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                {ALGORITHMS[selectedAlgo].description}
              </p>

              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Formula:</p>
                <code className="text-sm font-mono text-slate-800">
                  {ALGORITHMS[selectedAlgo].formula}
                </code>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{ALGORITHMS[selectedAlgo].code}</code>
              </pre>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}