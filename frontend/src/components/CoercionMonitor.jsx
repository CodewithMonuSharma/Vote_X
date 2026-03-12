import { useState, useEffect, useRef, useCallback } from "react";
import { castVoteOnChain } from "../utils/contract";

// Landmark indices
const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
const NOSE_TIP = 1;
const LEFT_CHEEK = 93;
const RIGHT_CHEEK = 323;

// Pose landmark indices
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateEAR(landmarks, eyeIndices) {
  const [p1, p2, p3, p4, p5, p6] = eyeIndices.map((i) => landmarks[i]);
  const vertical1 = distance(p2, p6);
  const vertical2 = distance(p3, p5);
  const horizontal = distance(p1, p4);
  if (horizontal === 0) return 1;
  return (vertical1 + vertical2) / (2 * horizontal);
}

export default function CoercionMonitor({ commitmentHash, onCoercionDetected }) {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [active, setActive] = useState(false);
  const [coercionDetected, setCoercionDetected] = useState(false);
  const [dummyVoteCast, setDummyVoteCast] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Tracking refs for suspicion scoring
  const suspicionRef = useRef(0);
  const blinkTimesRef = useRef([]);
  const gazeAwayStartRef = useRef(null);
  const headTurnCountRef = useRef(0);
  const headTurnTimerRef = useRef(Date.now());
  const lastYawRef = useRef(0);
  const noFaceStartRef = useRef(null);
  const decayTimerRef = useRef(Date.now());
  const shoulderBaselineRef = useRef(null);
  const blinkStateRef = useRef({ wasClosed: false });

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
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const { FaceLandmarker, PoseLandmarker, FilesetResolver } = vision;

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
            numFaces: 3,
            outputFaceBlendshapes: false,
          }
        );

        if (cancelled) return;
        faceLandmarkerRef.current = faceLandmarker;

        // PoseLandmarker for body posture
        let poseLandmarker = null;
        try {
          poseLandmarker = await PoseLandmarker.createFromOptions(
            filesetResolver,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
            }
          );
        } catch (e) {
          console.warn("PoseLandmarker not available, continuing with face only:", e.message);
        }

        if (cancelled) return;
        poseLandmarkerRef.current = poseLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setActive(true);
      } catch (err) {
        console.warn("CoercionMonitor init failed:", err.message);
      }
    }

    init();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cleanup]);

  // Monitoring loop
  useEffect(() => {
    if (!active || coercionDetected) return;

    let lastTime = -1;

    function monitor() {
      if (!videoRef.current || !faceLandmarkerRef.current) return;
      const video = videoRef.current;

      if (video.readyState < 2) {
        animationRef.current = requestAnimationFrame(monitor);
        return;
      }

      const now = performance.now();
      if (now === lastTime) {
        animationRef.current = requestAnimationFrame(monitor);
        return;
      }
      lastTime = now;

      // Decay suspicion score every 5s
      const currentTime = Date.now();
      if (currentTime - decayTimerRef.current > 5000) {
        suspicionRef.current = Math.max(0, suspicionRef.current - 1);
        decayTimerRef.current = currentTime;
      }

      // Reset head turn counter every 10s
      if (currentTime - headTurnTimerRef.current > 10000) {
        headTurnCountRef.current = 0;
        headTurnTimerRef.current = currentTime;
      }

      // --- Face analysis ---
      let faceResults;
      try {
        faceResults = faceLandmarkerRef.current.detectForVideo(video, now);
      } catch {
        animationRef.current = requestAnimationFrame(monitor);
        return;
      }

      const faceCount = faceResults.faceLandmarks ? faceResults.faceLandmarks.length : 0;

      // Multiple faces = immediate coercion trigger
      if (faceCount > 1) {
        triggerCoercion("Multiple people detected near the voting terminal.");
        return;
      }

      // No face for > 2s
      if (faceCount === 0) {
        if (!noFaceStartRef.current) {
          noFaceStartRef.current = currentTime;
        } else if (currentTime - noFaceStartRef.current > 2000) {
          suspicionRef.current += 2;
          noFaceStartRef.current = currentTime;
        }
      } else {
        noFaceStartRef.current = null;
        const landmarks = faceResults.faceLandmarks[0];

        // Rapid blinking detection
        const leftEAR = calculateEAR(landmarks, LEFT_EYE);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
        const avgEAR = (leftEAR + rightEAR) / 2;

        if (avgEAR < 0.18 && !blinkStateRef.current.wasClosed) {
          blinkStateRef.current.wasClosed = true;
          blinkTimesRef.current.push(currentTime);
          // Keep only last 3 seconds of blinks
          blinkTimesRef.current = blinkTimesRef.current.filter(
            (t) => currentTime - t < 3000
          );
          if (blinkTimesRef.current.length > 9) {
            suspicionRef.current += 2;
            blinkTimesRef.current = [];
          }
        } else if (avgEAR > 0.25) {
          blinkStateRef.current.wasClosed = false;
        }

        // Gaze direction (head yaw)
        const nose = landmarks[NOSE_TIP];
        const leftCheek = landmarks[LEFT_CHEEK];
        const rightCheek = landmarks[RIGHT_CHEEK];
        const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
        const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
        const yawOffset = faceWidth > 0 ? (nose.x - faceCenterX) / faceWidth : 0;

        // Prolonged gaze away (>3s)
        if (Math.abs(yawOffset) > 0.2) {
          if (!gazeAwayStartRef.current) {
            gazeAwayStartRef.current = currentTime;
          } else if (currentTime - gazeAwayStartRef.current > 3000) {
            suspicionRef.current += 1;
            gazeAwayStartRef.current = currentTime;
          }
        } else {
          gazeAwayStartRef.current = null;
        }

        // Head turn oscillation
        const yawSign = Math.sign(yawOffset);
        if (yawSign !== 0 && yawSign !== lastYawRef.current && Math.abs(yawOffset) > 0.1) {
          headTurnCountRef.current++;
          if (headTurnCountRef.current > 5) {
            suspicionRef.current += 2;
            headTurnCountRef.current = 0;
          }
        }
        lastYawRef.current = yawSign;
      }

      // --- Pose analysis ---
      if (poseLandmarkerRef.current && faceCount > 0) {
        try {
          const poseResults = poseLandmarkerRef.current.detectForVideo(video, now + 1);
          if (poseResults.landmarks && poseResults.landmarks.length > 0) {
            const poseLandmarks = poseResults.landmarks[0];
            const leftShoulder = poseLandmarks[LEFT_SHOULDER];
            const rightShoulder = poseLandmarks[RIGHT_SHOULDER];

            if (leftShoulder && rightShoulder) {
              const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);

              if (!shoulderBaselineRef.current) {
                shoulderBaselineRef.current = shoulderDiff;
              } else if (shoulderDiff > shoulderBaselineRef.current + 0.08) {
                suspicionRef.current += 1;
              }
            }
          }
        } catch {
          // Pose detection failed silently
        }
      }

      // Check threshold
      if (suspicionRef.current >= 5) {
        triggerCoercion("Potential voting pressure detected. Your vote will be protected.");
        return;
      }

      animationRef.current = requestAnimationFrame(monitor);
    }

    animationRef.current = requestAnimationFrame(monitor);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, coercionDetected]);

  async function triggerCoercion(message) {
    setCoercionDetected(true);
    setAlertMessage(message);

    // Cast dummy vote silently
    if (commitmentHash && !dummyVoteCast) {
      try {
        await castVoteOnChain(commitmentHash, 0);
        setDummyVoteCast(true);
      } catch (err) {
        console.warn("Dummy vote failed:", err.message);
      }
    }

    setShowAlert(true);
    if (onCoercionDetected) {
      onCoercionDetected();
    }
  }

  function dismissAlert() {
    setShowAlert(false);
    setCoercionDetected(false);
    suspicionRef.current = 0;
  }

  return (
    <>
      {/* Hidden video element for monitoring */}
      <video
        ref={videoRef}
        className="hidden"
        muted
        playsInline
        style={{ width: 1, height: 1 }}
      />

      {/* Active indicator */}
      {active && !showAlert && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-surface/90 border border-neon-cyan/20 rounded-full px-4 py-2 z-50">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-400">Security Monitor Active</span>
        </div>
      )}

      {/* Coercion alert modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-deep-purple border border-red-500/50 rounded-xl p-8 max-w-md shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="text-center">
              <div className="text-4xl mb-4">&#9888;</div>
              <h3 className="font-orbitron text-red-400 text-lg mb-4">
                Security Alert
              </h3>
              <p className="text-gray-300 font-mono text-sm mb-6">{alertMessage}</p>
              {dummyVoteCast && (
                <p className="text-yellow-400 font-mono text-xs mb-6">
                  A protective vote has been recorded. You may override it by casting your real vote.
                </p>
              )}
              <button
                onClick={dismissAlert}
                className="px-6 py-3 bg-neon-cyan text-cyber-dark font-orbitron font-bold rounded-lg glow-button transition"
              >
                Continue Voting
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
