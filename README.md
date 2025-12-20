Pulmonary Respiration Analysis & Noise-free Assessment

PRANA is a lightweight, offline, and explainable respiratory health screening system that analyzes breathing sounds captured through a smartphone microphone to determine whether a user’s breathing is normal or abnormal.
It further classifies normal breathing into deep or slow breathing, and provides confidence-based insights, remedies, and recommendations for abnormal breathing patterns.

⚠️ Disclaimer: PRANA is a screening and assistive tool, not a medical diagnosis system.

🚀 Features

🎙️ Captures breathing audio using microphone input

📊 Signal-processing–based analysis (no black-box ML)

🧠 Uses core DSA concepts for real-time processing

✅ Classifies breathing as:

Normal → Deep / Slow

Abnormal → Confidence %, reasons & remedies

📄 Generates a clear CLI-based respiratory health report

🔌 Fully offline and lightweight

🎓 Designed for academic evaluation, hackathons & demos

🧠 Core Technologies & Concepts
Data Structures Used

Queue / Circular Buffer → real-time audio streaming

Sliding Window → frame-wise audio analysis

Hash Map (Struct-based) → feature storage

Priority Queue (Logical) → abnormality severity ranking

Algorithms Used

Energy-based analysis

Zero Crossing Rate (ZCR)

Fast Fourier Transform (FFT – simplified)

Peak detection

Threshold-based decision logic

🔄 Processing Pipeline

Audio Acquisition

Reads 5–10 seconds of breathing audio (16 kHz WAV)

Uses circular buffer logic

Feature Extraction (Sliding Window)

Signal energy

RMS amplitude

Zero Crossing Rate (ZCR)

Dominant frequency

Breathing cycle stability

Breathing Classification

Normal breathing

Deep breathing

Slow breathing

Abnormal breathing

Irregular patterns

Sudden peaks

High ZCR

Report Generation

Breathing status

Confidence score

Possible reasons

Remedies & health recommendations
