/**
 * PRANA Audio Processing Engine
 * Implements DSA concepts for respiratory analysis
 */

// ========================================
// DATA STRUCTURE: Circular Buffer (Queue)
// Used for real-time audio streaming
// ========================================
export class CircularBuffer {
  constructor(size) {
    this.buffer = new Float32Array(size);
    this.size = size;
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  push(value) {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.size;
    if (this.count < this.size) {
      this.count++;
    } else {
      this.head = (this.head + 1) % this.size;
    }
  }

  pushArray(arr) {
    for (let i = 0; i < arr.length; i++) {
      this.push(arr[i]);
    }
  }

  toArray() {
    const result = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      result[i] = this.buffer[(this.head + i) % this.size];
    }
    return result;
  }

  clear() {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }
}

// ========================================
// DATA STRUCTURE: Feature HashMap
// Stores extracted features for quick lookup
// ========================================
export class FeatureMap {
  constructor() {
    this.features = new Map();
    this.history = [];
  }

  set(key, value) {
    this.features.set(key, value);
  }

  get(key) {
    return this.features.get(key);
  }

  snapshot() {
    const snap = {};
    this.features.forEach((v, k) => { snap[k] = v; });
    this.history.push({ ...snap, timestamp: Date.now() });
    return snap;
  }

  getHistory() {
    return this.history;
  }

  clear() {
    this.features.clear();
    this.history = [];
  }
}

// ========================================
// DATA STRUCTURE: Priority Queue
// Used for ranking abnormality severity
// ========================================
export class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    const item = { element, priority };
    let added = false;
    
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority > this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(item);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  getAll() {
    return this.items.map(i => ({ ...i.element, severity: i.priority }));
  }

  isEmpty() {
    return this.items.length === 0;
  }

  clear() {
    this.items = [];
  }
}

// ========================================
// ALGORITHM: Fast Fourier Transform (FFT)
// Converts time-domain signal to frequency-domain
// ========================================
export function fft(signal) {
  const n = signal.length;
  
  // Pad to power of 2
  const paddedLength = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = new Float32Array(paddedLength);
  padded.set(signal);
  
  // Simple DFT for smaller signals (educational clarity)
  const real = new Float32Array(paddedLength / 2);
  const imag = new Float32Array(paddedLength / 2);
  const magnitudes = new Float32Array(paddedLength / 2);
  
  for (let k = 0; k < paddedLength / 2; k++) {
    let sumReal = 0;
    let sumImag = 0;
    
    for (let t = 0; t < paddedLength; t++) {
      const angle = (2 * Math.PI * k * t) / paddedLength;
      sumReal += padded[t] * Math.cos(angle);
      sumImag -= padded[t] * Math.sin(angle);
    }
    
    real[k] = sumReal;
    imag[k] = sumImag;
    magnitudes[k] = Math.sqrt(sumReal * sumReal + sumImag * sumImag);
  }
  
  return { real, imag, magnitudes };
}

// ========================================
// ALGORITHM: Zero Crossing Rate (ZCR)
// Measures signal frequency characteristics
// ========================================
export function calculateZCR(signal) {
  let crossings = 0;
  
  for (let i = 1; i < signal.length; i++) {
    if ((signal[i] >= 0 && signal[i - 1] < 0) || 
        (signal[i] < 0 && signal[i - 1] >= 0)) {
      crossings++;
    }
  }
  
  return crossings / (signal.length - 1);
}

// ========================================
// ALGORITHM: Signal Energy Calculation
// Measures breathing intensity
// ========================================
export function calculateEnergy(signal) {
  let energy = 0;
  for (let i = 0; i < signal.length; i++) {
    energy += signal[i] * signal[i];
  }
  return energy / signal.length;
}

// ========================================
// ALGORITHM: RMS Amplitude
// Root Mean Square for amplitude measurement
// ========================================
export function calculateRMS(signal) {
  return Math.sqrt(calculateEnergy(signal));
}

// ========================================
// ALGORITHM: Peak Detection
// Identifies breathing cycles
// ========================================
export function detectPeaks(signal, threshold = 0.1) {
  const peaks = [];
  const minDistance = Math.floor(signal.length / 20); // Minimum distance between peaks
  
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && 
        signal[i] > signal[i + 1] && 
        signal[i] > threshold) {
      
      // Check minimum distance from last peak
      if (peaks.length === 0 || i - peaks[peaks.length - 1].index > minDistance) {
        peaks.push({ index: i, value: signal[i] });
      }
    }
  }
  
  return peaks;
}

// ========================================
// ALGORITHM: Sliding Window Analysis
// Frame-wise feature extraction
// ========================================
export function slidingWindowAnalysis(signal, windowSize, hopSize, sampleRate) {
  const windows = [];
  
  for (let start = 0; start < signal.length - windowSize; start += hopSize) {
    const window = signal.slice(start, start + windowSize);
    
    const energy = calculateEnergy(window);
    const rms = calculateRMS(window);
    const zcr = calculateZCR(window);
    const fftResult = fft(window);
    
    // Find dominant frequency
    let maxMag = 0;
    let dominantFreqBin = 0;
    for (let i = 1; i < fftResult.magnitudes.length; i++) {
      if (fftResult.magnitudes[i] > maxMag) {
        maxMag = fftResult.magnitudes[i];
        dominantFreqBin = i;
      }
    }
    
    const dominantFreq = (dominantFreqBin * sampleRate) / (windowSize * 2);
    
    windows.push({
      startSample: start,
      energy,
      rms,
      zcr,
      dominantFreq,
      fftMagnitudes: fftResult.magnitudes,
      timestamp: start / sampleRate
    });
  }
  
  return windows;
}

// ========================================
// ALGORITHM: Noise Removal (Simple Threshold)
// Removes silence and background noise
// ========================================
export function removeNoise(signal, noiseThreshold = 0.02) {
  const cleaned = new Float32Array(signal.length);
  
  for (let i = 0; i < signal.length; i++) {
    if (Math.abs(signal[i]) > noiseThreshold) {
      cleaned[i] = signal[i];
    } else {
      cleaned[i] = 0;
    }
  }
  
  return cleaned;
}

// ========================================
// MAIN ANALYSIS ENGINE
// Combines all DSA concepts for classification
// ========================================
export function analyzeBreathing(audioData, sampleRate = 16000) {
  const featureMap = new FeatureMap();
  const abnormalityQueue = new PriorityQueue();
  
  // Step 1: Noise removal
  const cleanedSignal = removeNoise(audioData);
  
  // Step 2: Sliding window analysis
  const windowSize = Math.floor(sampleRate * 0.5); // 500ms windows
  const hopSize = Math.floor(windowSize / 2); // 50% overlap
  const windowFeatures = slidingWindowAnalysis(cleanedSignal, windowSize, hopSize, sampleRate);
  
  // Step 3: Calculate overall statistics
  const avgEnergy = windowFeatures.reduce((sum, w) => sum + w.energy, 0) / windowFeatures.length;
  const avgRMS = windowFeatures.reduce((sum, w) => sum + w.rms, 0) / windowFeatures.length;
  const avgZCR = windowFeatures.reduce((sum, w) => sum + w.zcr, 0) / windowFeatures.length;
  const avgDominantFreq = windowFeatures.reduce((sum, w) => sum + w.dominantFreq, 0) / windowFeatures.length;
  
  // Energy variance (rhythm stability)
  const energyVariance = windowFeatures.reduce((sum, w) => 
    sum + Math.pow(w.energy - avgEnergy, 2), 0) / windowFeatures.length;
  
  // Peak detection for breathing cycle
  const envelope = windowFeatures.map(w => w.rms);
  const peaks = detectPeaks(new Float32Array(envelope), avgRMS * 0.5);
  
  // Calculate breathing rate (breaths per minute)
  const durationSeconds = audioData.length / sampleRate;
  const breathingRate = peaks.length > 1 ? 
    (peaks.length / durationSeconds) * 60 : 12; // Default to 12 if unclear
  
  // Store features in HashMap
  featureMap.set('avgEnergy', avgEnergy);
  featureMap.set('avgRMS', avgRMS);
  featureMap.set('avgZCR', avgZCR);
  featureMap.set('avgDominantFreq', avgDominantFreq);
  featureMap.set('energyVariance', energyVariance);
  featureMap.set('breathingRate', breathingRate);
  featureMap.set('peakCount', peaks.length);
  featureMap.set('windowFeatures', windowFeatures);
  
  // Step 4: Classification Logic
  const classification = classifyBreathing(featureMap, abnormalityQueue);
  
  return {
    features: featureMap.snapshot(),
    classification,
    abnormalities: abnormalityQueue.getAll(),
    windowFeatures,
    peaks
  };
}

// ========================================
// CLASSIFICATION ALGORITHM
// Threshold-based decision logic
// ========================================
function classifyBreathing(featureMap, abnormalityQueue) {
  const avgEnergy = featureMap.get('avgEnergy');
  const avgRMS = featureMap.get('avgRMS');
  const avgZCR = featureMap.get('avgZCR');
  const energyVariance = featureMap.get('energyVariance');
  const breathingRate = featureMap.get('breathingRate');
  const windowFeatures = featureMap.get('windowFeatures');
  
  // Thresholds (calibrated for typical breathing patterns)
  const NORMAL_ZCR_MAX = 0.08;  // More sensitive
  const NORMAL_VARIANCE_MAX = 0.0005;  // More sensitive
  const NORMAL_BREATHING_RATE_MIN = 10;
  const NORMAL_BREATHING_RATE_MAX = 18;
  const HIGH_AMPLITUDE_THRESHOLD = 0.06;
  const LOW_AMPLITUDE_THRESHOLD = 0.01;
  const MIN_SIGNAL_THRESHOLD = 0.008;
  
  let isNormal = true;
  let abnormalityScore = 0;
  
  // Check 1: Zero Crossing Rate (indicates wheezing/high frequency noise)
  if (avgZCR > NORMAL_ZCR_MAX) {
    const severity = Math.min(100, ((avgZCR - NORMAL_ZCR_MAX) / NORMAL_ZCR_MAX) * 100);
    abnormalityQueue.enqueue({
      type: 'wheezing',
      description: 'Wheezing pattern detected (high frequency)',
      percentage: Math.round(Math.max(35, severity))
    }, severity);
    abnormalityScore += severity * 0.4;
    isNormal = false;
  }
  
  // Check 2: Energy Variance (rhythm irregularity)
  if (energyVariance > NORMAL_VARIANCE_MAX) {
    const severity = Math.min(100, ((energyVariance - NORMAL_VARIANCE_MAX) / NORMAL_VARIANCE_MAX) * 80);
    abnormalityQueue.enqueue({
      type: 'irregular',
      description: 'Irregular breathing rhythm detected',
      percentage: Math.round(Math.max(30, severity))
    }, severity);
    abnormalityScore += severity * 0.35;
    isNormal = false;
  }
  
  // Check 3: Breathing Rate
  if (breathingRate < NORMAL_BREATHING_RATE_MIN || breathingRate > NORMAL_BREATHING_RATE_MAX) {
    let severity;
    let description;
    
    if (breathingRate < NORMAL_BREATHING_RATE_MIN) {
      severity = ((NORMAL_BREATHING_RATE_MIN - breathingRate) / NORMAL_BREATHING_RATE_MIN) * 70;
      description = 'Slow breathing rate (Bradypnea)';
    } else {
      severity = ((breathingRate - NORMAL_BREATHING_RATE_MAX) / NORMAL_BREATHING_RATE_MAX) * 80;
      description = 'Rapid breathing rate (Tachypnea)';
    }
    
    abnormalityQueue.enqueue({
      type: 'shortness',
      description: description,
      percentage: Math.round(Math.max(25, Math.min(100, severity)))
    }, severity);
    abnormalityScore += severity * 0.3;
    isNormal = false;
  }
  
  // Check 4: Signal Quality (too low = noise/poor recording)
  if (avgRMS < MIN_SIGNAL_THRESHOLD || avgEnergy < 0.00005) {
    abnormalityQueue.enqueue({
      type: 'noise',
      description: 'Poor signal quality / Environmental noise',
      percentage: 35
    }, 35);
    abnormalityScore += 15;
  }
  
  // Check 5: Energy spikes (coughing or gasping)
  if (windowFeatures && windowFeatures.length > 3) {
    const energySpikes = windowFeatures.filter((w, i) => {
      if (i === 0) return false;
      const prevEnergy = windowFeatures[i - 1].energy;
      return w.energy > prevEnergy * 3; // More than 3x increase
    }).length;
    
    if (energySpikes > 1) {
      const severity = Math.min(80, energySpikes * 20);
      abnormalityQueue.enqueue({
        type: 'irregular',
        description: 'Sudden energy spikes (cough/gasp pattern)',
        percentage: Math.round(severity)
      }, severity);
      abnormalityScore += severity * 0.25;
      isNormal = false;
    }
  }
  
  // Calculate stability score
  const stabilityScore = Math.max(0, 100 - (energyVariance * 15000));
  
  // Final classification
  if (isNormal && abnormalityScore < 20) {
    // Determine breathing type
    const isDeepBreathing = avgRMS > HIGH_AMPLITUDE_THRESHOLD && breathingRate < 14;
    const isSlowBreathing = avgRMS < HIGH_AMPLITUDE_THRESHOLD && breathingRate < 12;
    
    return {
      status: 'normal',
      breathingType: isDeepBreathing ? 'deep' : (isSlowBreathing ? 'slow' : 'regular'),
      stabilityScore: Math.round(stabilityScore),
      lungComfort: stabilityScore > 80 ? 'Good' : (stabilityScore > 60 ? 'Moderate' : 'Fair'),
      confidenceScore: Math.round(Math.max(75, 100 - abnormalityScore))
    };
  } else {
    // Add general abnormality if no specific patterns found but score is high
    if (abnormalityQueue.isEmpty() && abnormalityScore > 0) {
      abnormalityQueue.enqueue({
        type: 'irregular',
        description: 'General breathing irregularity',
        percentage: Math.round(Math.min(100, abnormalityScore))
      }, abnormalityScore);
    }
    
    return {
      status: 'abnormal',
      abnormalityConfidence: Math.round(Math.min(100, Math.max(30, abnormalityScore))),
      stabilityScore: Math.round(stabilityScore),
      lungComfort: 'Needs Attention',
      confidenceScore: Math.round(Math.min(95, abnormalityScore + 35))
    };
  }
}