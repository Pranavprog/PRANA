import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DebugPanel({ analysisResult }) {
  if (!analysisResult) return null;

  const { features, classification } = analysisResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
            <Code className="w-4 h-4" />
            Debug Info (Feature Values)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <DebugMetric 
              label="Avg Energy" 
              value={features.avgEnergy?.toFixed(6)}
              threshold="< 0.00005"
              isGood={features.avgEnergy >= 0.00005}
            />
            <DebugMetric 
              label="Avg RMS" 
              value={features.avgRMS?.toFixed(4)}
              threshold="> 0.008"
              isGood={features.avgRMS >= 0.008}
            />
            <DebugMetric 
              label="Zero Cross Rate" 
              value={features.avgZCR?.toFixed(4)}
              threshold="< 0.08"
              isGood={features.avgZCR < 0.08}
            />
            <DebugMetric 
              label="Energy Variance" 
              value={features.energyVariance?.toFixed(6)}
              threshold="< 0.0005"
              isGood={features.energyVariance < 0.0005}
            />
            <DebugMetric 
              label="Breathing Rate" 
              value={`${features.breathingRate?.toFixed(1)} /min`}
              threshold="10-18 /min"
              isGood={features.breathingRate >= 10 && features.breathingRate <= 18}
            />
            <DebugMetric 
              label="Peak Count" 
              value={features.peakCount}
              threshold=">= 2"
              isGood={features.peakCount >= 2}
            />
            <DebugMetric 
              label="Dominant Freq" 
              value={`${features.avgDominantFreq?.toFixed(1)} Hz`}
              threshold="N/A"
              isGood={true}
            />
            <DebugMetric 
              label="Status" 
              value={classification.status}
              threshold=""
              isGood={classification.status === 'normal'}
            />
          </div>

          {/* Classification Explanation */}
          <div className="mt-3 p-2 bg-white rounded border border-slate-200">
            <p className="text-xs text-slate-600 font-mono">
              {classification.status === 'normal' 
                ? '✓ All parameters within normal range' 
                : '⚠ One or more parameters outside normal range'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DebugMetric({ label, value, threshold, isGood }) {
  return (
    <div className="bg-white p-2 rounded border border-slate-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-500 font-medium">{label}</span>
        {isGood ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1 py-0">✓</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-1 py-0">!</Badge>
        )}
      </div>
      <p className={`font-mono font-bold ${isGood ? 'text-slate-800' : 'text-amber-600'}`}>
        {value}
      </p>
      {threshold && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          Normal: {threshold}
        </p>
      )}
    </div>
  );
}