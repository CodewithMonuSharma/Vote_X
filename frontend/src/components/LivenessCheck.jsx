import { useState, useEffect, useRef, useCallback } from "react";

// Landmark indices for Eye Aspect Ratio
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const NOSE_TIP = 1;
const LEFT_CHEEK = 93;
const RIGHT_CHEEK = 323;
const MOUTH_LEFT = 61;
const MOUTH_RIGHT = 291;
const UPPER_LIP = 13;
const LOWER_LIP = 14;

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2);
}

function calculateEAR(landmarks, eyeIndices) {
  const [p1, p2, p3, p4, p5, p6] = eyeIndices.map((i) => landmarks[i]);
  const vertical1 = distance(p2, p6);
  const vertical2 = distance(p3, p5);
  const horizontal = distance(p1, p4);
  if (horizontal === 0) return 1;
  return (vertical1 + vertical2) / (2 * horizontal);
}

const CHALLENGES = [
  { id: "blink", label: "Blink your eyes", icon: "👁" },
  { id: "turn_left", label: "Turn your head left", icon: "⬅" },
  { id: "turn_right", label: "Turn your head right", icon: "➡" },
  { id: "smile", label: "Smile at the camera", icon: "😊" },
];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LivenessCheck({ onPass }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [challenges, setChallenges] = useState(() => shuffleArray(CHALLENGES));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [faceCount, setFaceCount] = useState(0);
  const [allPassed, setAllPassed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing AI...");

  // Blink detection state
  const blinkStateRef = useRef({ wasClosed: false });
  // Track detection hits for debouncing
  const detectionCountRef = useRef({});

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatusMessage("Loading AI models...");

        const vision = await import("@mediapipe/tasks-vision");
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (cancelled) return;

        const faceLandmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numFaces: 2,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: false,
          }
        );

        if (cancelled) return;
        faceLandmarkerRef.current = faceLandmarker;

        setStatusMessage("Accessing camera...");

        // Timeout camera access to handle headless/no-camera environments
        const cameraTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Camera access timed out. Use Demo Mode to continue.")), 8000)
        );
        const stream = await Promise.race([
          navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
          }),
          cameraTimeout,
        ]);

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setLoading(false);
        setStatusMessage("Position your face in the frame");
      } catch (err) {
        if (!cancelled) {
          console.error("LivenessCheck init error:", err);
          if (err.name === "NotAllowedError") {
            setError("Camera permission denied. Please allow camera access and reload.");
          } else {
            setError("Failed to initialize: " + err.message);
          }
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cleanup]);

  // Detection loop
  useEffect(() => {
    if (loading || error || allPassed || !faceLandmarkerRef.current) return;

    let lastTime = -1;

    function detect() {
      if (!videoRef.current || !faceLandmarkerRef.current) return;
      const video = videoRef.current;

      if (video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      if (now === lastTime) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTime = now;

      let results;
      try {
        results = faceLandmarkerRef.current.detectForVideo(video, now);
      } catch {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      // Draw on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw face mesh points
        if (results.faceLandmarks) {
          results.faceLandmarks.forEach((landmarks) => {
            ctx.fillStyle = "rgba(0, 210, 255, 0.4)";
            landmarks.forEach((lm) => {
              ctx.beginPath();
              ctx.arc(
                lm.x * canvasRef.current.width,
                lm.y * canvasRef.current.height,
                1,
                0,
                2 * Math.PI
              );
              ctx.fill();
            });
          });
        }
      }

      const faceNum = results.faceLandmarks ? results.faceLandmarks.length : 0;
      setFaceCount(faceNum);

      if (faceNum === 0) {
        setStatusMessage("No face detected — look at the camera");
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      if (faceNum > 1) {
        setStatusMessage("Multiple faces detected — only one person allowed");
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const landmarks = results.faceLandmarks[0];
      const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
      const currentChallenge = challenges[currentIndex];

      if (!currentChallenge) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      let detected = false;

      switch (currentChallenge.id) {
        case "blink": {
          const leftEAR = calculateEAR(landmarks, LEFT_EYE);
          const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
          const avgEAR = (leftEAR + rightEAR) / 2;
          if (avgEAR < 0.18) {
            blinkStateRef.current.wasClosed = true;
          } else if (blinkStateRef.current.wasClosed && avgEAR > 0.25) {
            blinkStateRef.current.wasClosed = false;
            detected = true;
          }
          break;
        }
        case "turn_left": {
          const nose = landmarks[NOSE_TIP];
          const leftCheek = landmarks[LEFT_CHEEK];
          const rightCheek = landmarks[RIGHT_CHEEK];
          const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
          const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
          const offset = (nose.x - faceCenterX) / faceWidth;
          // Nose moves left of center when turning left (mirrored video)
          if (offset > 0.15) {
            detected = true;
          }
          break;
        }
        case "turn_right": {
          const nose = landmarks[NOSE_TIP];
          const leftCheek = landmarks[LEFT_CHEEK];
          const rightCheek = landmarks[RIGHT_CHEEK];
          const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
          const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
          const offset = (nose.x - faceCenterX) / faceWidth;
          if (offset < -0.15) {
            detected = true;
          }
          break;
        }
        case "smile": {
          // Try blendshapes first
          const smileLeft = blendshapes.find((b) => b.categoryName === "mouthSmileLeft");
          const smileRight = blendshapes.find((b) => b.categoryName === "mouthSmileRight");
          if (smileLeft && smileRight) {
            if (smileLeft.score + smileRight.score > 0.5) {
              detected = true;
            }
          } else {
            // Fallback: mouth width/height ratio
            const mouthWidth = distance(landmarks[MOUTH_LEFT], landmarks[MOUTH_RIGHT]);
            const mouthHeight = distance(landmarks[UPPER_LIP], landmarks[LOWER_LIP]);
            if (mouthHeight > 0 && mouthWidth / mouthHeight > 3.0) {
              detected = true;
            }
          }
          break;
        }
      }

      if (detected) {
        // Debounce: require 3 consecutive frames of detection
        const key = currentChallenge.id;
        detectionCountRef.current[key] = (detectionCountRef.current[key] || 0) + 1;
        if (detectionCountRef.current[key] >= 3) {
          setCompleted((prev) => {
            if (prev.includes(key)) return prev;
            const next = [...prev, key];
            if (next.length >= challenges.length) {
              setAllPassed(true);
              setStatusMessage("All challenges passed!");
            }
            return next;
          });
          setCurrentIndex((prev) => Math.min(prev + 1, challenges.length));
          detectionCountRef.current[key] = 0;
        }
      } else {
        const key = currentChallenge?.id;
        if (key) detectionCountRef.current[key] = 0;
        setStatusMessage(currentChallenge.label);
      }

      animationRef.current = requestAnimationFrame(detect);
    }

    animationRef.current = requestAnimationFrame(detect);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [loading, error, allPassed, currentIndex, challenges]);

  // Auto-proceed after all passed
  useEffect(() => {
    if (allPassed && onPass) {
      const timer = setTimeout(() => {
        cleanup();
        onPass();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [allPassed, onPass, cleanup]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
          <div className="text-2xl mb-2">&#9888;</div>
          <p className="font-mono">{error}</p>
        </div>
        <button
          onClick={() => onPass && onPass()}
          className="mt-4 px-6 py-2 bg-surface border border-neon-cyan/30 text-neon-cyan rounded hover:bg-neon-cyan/10 transition font-mono text-sm"
        >
          Skip (Demo Mode)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera viewport */}
      <div className="relative border-2 border-neon-cyan/50 rounded-lg overflow-hidden shadow-neon" style={{ width: 640, maxWidth: "100%" }}>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-cyan z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-cyan z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-cyan z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-cyan z-10" />

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full block"
            style={{ transform: "scaleX(-1)" }}
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyber-dark/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
              <p className="text-neon-cyan font-mono text-sm">{statusMessage}</p>
              <button
                onClick={() => onPass && onPass()}
                className="mt-2 px-4 py-1 text-gray-500 hover:text-gray-300 font-mono text-xs transition"
              >
                Skip (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {/* Face count warnings */}
        {!loading && faceCount === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 px-4 py-2 rounded text-red-300 font-mono text-sm z-20">
            No face detected
          </div>
        )}
        {!loading && faceCount > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 px-4 py-2 rounded text-red-300 font-mono text-sm z-20">
            Multiple faces detected — only one allowed
          </div>
        )}
      </div>

      {/* Challenge display */}
      {!loading && !allPassed && challenges[currentIndex] && (
        <div className="text-center">
          <p className="text-neon-cyan font-orbitron text-xl mb-2">
            {challenges[currentIndex].icon} {challenges[currentIndex].label}
          </p>
          <p className="text-gray-400 font-mono text-sm">
            Challenge {currentIndex + 1} of {challenges.length}
          </p>
        </div>
      )}

      {/* All passed */}
      {allPassed && (
        <div className="text-center">
          <p className="text-green-400 font-orbitron text-xl glow-cyan">
            Liveness Verified
          </p>
          <p className="text-gray-400 font-mono text-sm mt-1">Redirecting to voting...</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          {challenges.map((c, i) => (
            <div
              key={c.id}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                completed.includes(c.id)
                  ? "bg-neon-cyan shadow-neon"
                  : i === currentIndex
                  ? "bg-neon-cyan/40"
                  : "bg-surface"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {challenges.map((c) => (
            <span
              key={c.id}
              className={`text-xs font-mono ${
                completed.includes(c.id) ? "text-neon-cyan" : "text-gray-600"
              }`}
            >
              {completed.includes(c.id) ? "\u2713" : c.icon}
            </span>
          ))}
        </div>
      </div>

      {/* Demo mode skip */}
      {!loading && !allPassed && (
        <button
          onClick={() => onPass && onPass()}
          className="px-4 py-1 text-gray-500 hover:text-gray-300 font-mono text-xs transition"
        >
          Skip (Demo Mode)
        </button>
      )}
    </div>
  );
}
