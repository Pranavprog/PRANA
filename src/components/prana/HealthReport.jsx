import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Wind, 
  Activity, 
  Heart,
  Droplets,
  Sun,
  Stethoscope,
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const REMEDIES = {
  wheezing: [
    { icon: Droplets, text: 'Steam inhalation for 10-15 minutes' },
    { icon: Wind, text: 'Practice pursed-lip breathing exercises' },
    { icon: Shield, text: 'Use air purifier in your room' }
  ],
  irregular: [
    { icon: Heart, text: 'Practice 4-7-8 breathing technique' },
    { icon: Activity, text: 'Monitor breathing patterns daily' },
    { icon: Sun, text: 'Reduce stress through relaxation' }
  ],
  shortness: [
    { icon: Wind, text: 'Diaphragmatic breathing exercises' },
    { icon: Droplets, text: 'Stay well hydrated' },
    { icon: Activity, text: 'Light physical activity as tolerated' }
  ],
  noise: [
    { icon: Shield, text: 'Record in a quieter environment' },
    { icon: Activity, text: 'Hold device closer to mouth' }
  ]
};

const RECOMMENDATIONS = [
  { icon: Activity, text: 'Monitor your breathing daily at the same time' },
  { icon: Shield, text: 'Avoid exposure to dust, smoke, and strong odors' },
  { icon: Droplets, text: 'Maintain proper hydration (8 glasses of water daily)' },
  { icon: Sun, text: 'Get adequate rest and manage stress levels' },
  { icon: Stethoscope, text: 'Consult a healthcare provider if symptoms persist' }
];

export default function HealthReport({ analysisResult }) {
  if (!analysisResult) return null;

  const { features, classification, abnormalities } = analysisResult;
  const isNormal = classification.status === 'normal';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className={`p-6 ${isNormal ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isNormal ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-white" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Respiratory Health Report
                </h2>
                <p className="text-white/80 text-sm">PRANA Analysis v0.1</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-lg px-4 py-2 ${isNormal ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}
            >
              {isNormal ? 'Normal' : 'Needs Attention'}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
              icon={Wind}
              label="Breathing Type"
              value={isNormal ? (classification.breathingType === 'deep' ? 'Deep Breathing' : 
                classification.breathingType === 'slow' ? 'Slow Breathing' : 'Regular') : 'Irregular'}
              color={isNormal ? 'text-emerald-500' : 'text-amber-500'}
            />
            <StatusCard
              icon={TrendingUp}
              label="Stability Score"
              value={`${classification.stabilityScore}%`}
              color={classification.stabilityScore > 70 ? 'text-emerald-500' : 'text-amber-500'}
            />
            <StatusCard
              icon={Heart}
              label="Lung Comfort"
              value={classification.lungComfort}
              color={classification.lungComfort === 'Good' ? 'text-emerald-500' : 'text-amber-500'}
            />
          </div>

          <Separator />

          {/* Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Analysis Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                label="Breathing Rate" 
                value={`${Math.round(features.breathingRate)} /min`}
                normal={features.breathingRate >= 8 && features.breathingRate <= 20}
              />
              <MetricCard 
                label="Signal Energy" 
                value={(features.avgEnergy * 1000).toFixed(2)}
                normal={features.avgEnergy > 0.0001}
              />
              <MetricCard 
                label="Zero Crossing Rate" 
                value={features.avgZCR.toFixed(3)}
                normal={features.avgZCR < 0.15}
              />
              <MetricCard 
                label="Breath Cycles" 
                value={features.peakCount}
                normal={features.peakCount >= 2}
              />
            </div>
          </div>

          {/* Abnormalities (if any) */}
          {!isNormal && abnormalities.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Detected Patterns
                  </h3>
                </div>
                <div className="space-y-3">
                  {abnormalities.map((abnormality, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-amber-800">
                          {abnormality.description}
                        </span>
                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          {abnormality.percentage}% confidence
                        </Badge>
                      </div>
                      <Progress 
                        value={abnormality.percentage} 
                        className="h-2"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Remedies */}
          {!isNormal && abnormalities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  💊 Suggested Remedies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {abnormalities.slice(0, 2).flatMap((abn, i) => 
                    (REMEDIES[abn.type] || []).map((remedy, j) => (
                      <motion.div
                        key={`${i}-${j}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i * 3 + j) * 0.05 }}
                        className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-lg p-3"
                      >
                        <remedy.icon className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{remedy.text}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Health Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              📋 Health Recommendations
            </h3>
            <div className="space-y-2">
              {RECOMMENDATIONS.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 py-2"
                >
                  <rec.icon className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">{rec.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-600 mb-1">⚠️ Important Disclaimer</p>
              <p>
                PRANA is a screening and assistive tool only. It is NOT a medical diagnostic device. 
                Results should not replace professional medical advice, diagnosis, or treatment. 
                Always consult a qualified healthcare provider for any respiratory concerns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, normal }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`font-bold text-lg ${normal ? 'text-slate-800' : 'text-amber-600'}`}>
        {value}
      </p>
    </div>
  );
}