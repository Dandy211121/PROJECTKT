import { useEffect, useRef, useState } from "react";
import { Camera, Maximize, Pause, Play, Settings2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";
import {
  getCctvStreamUrl,
  connectCameraWebSocket,
  detectFrameWithAI,
  fetchCameras,
} from "../lib/api";

const defaultCameras = [
  { id: "Cam A-01", name: "Cam A-01", block: "Blok A" },
  { id: "Cam A-02", name: "Cam A-02", block: "Blok A" },
  { id: "Cam B-01", name: "Cam B-01", block: "Blok B" },
  { id: "Cam C-01", name: "Cam C-01", block: "Blok C" },
];

const toneClass = {
  ripe: "bounding-box-gold",
  unripe: "bounding-box-sky",
  overripe: "bounding-box-ocean",
};

export function VideoPlayer({
  showOverlayControl = false,
  activeCam: selectedCamera,
  onCameraChange,
  timestamp = "2026-10-14 21:07:00",
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [internalCamera, setInternalCamera] = useState("Cam A-01");
  const [detections, setDetections] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [streamAvailable, setStreamAvailable] = useState(true);
  const [cameraList, setCameraList] = useState(defaultCameras);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const activeCam = selectedCamera ?? internalCamera;
  const setActiveCam = onCameraChange ?? setInternalCamera;

  // Ambil daftar kamera dari backend jika tersedia
  useEffect(() => {
    let mounted = true;
    fetchCameras()
      .then((cams) => {
        if (mounted && Array.isArray(cams) && cams.length > 0) {
          const mapped = cams
            .filter((c) => c.id !== "device")
            .map((c) => ({
              id: c.id,
              name: c.id,
              block: c.location || "Blok A",
            }));
          if (mapped.length > 0) setCameraList(mapped);
        }
      })
      .catch(() => {
        // Gunakan defaultCameras
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Hubungkan WebSocket telemetri real-time saat kamera CCTV dipilih
  useEffect(() => {
    if (activeCam === "device") return undefined;
    queueMicrotask(() => setStreamAvailable(true));
    const disconnect = connectCameraWebSocket(
      activeCam,
      (telemetry) => {
        if (telemetry?.detections && telemetry.detections.length > 0) {
          setDetections(
            telemetry.detections.map((d) => ({
              id: d.id,
              left: d.box_normalized.left,
              top: d.box_normalized.top,
              width: d.box_normalized.width,
              height: d.box_normalized.height,
              status: d.prediction === "Mature" ? "Matang" : d.prediction === "Immature" ? "Mentah" : "Busuk",
              confidence: Math.round(d.confidence),
              type: d.type || (d.prediction === "Mature" ? "ripe" : d.prediction === "Immature" ? "unripe" : "overripe"),
            }))
          );
        }
      },
      () => {
        // WebSocket error
      }
    );
    return () => disconnect();
  }, [activeCam]);

  // Muat model COCO-SSD sebagai backup untuk webcam jika offline
  useEffect(() => {
    if (activeCam !== "device") return undefined;
    let isMounted = true;
    import("@tensorflow-models/coco-ssd")
      .then((cocoSsd) => cocoSsd.load())
      .catch((error) => {
        console.error("Gagal memuat model lokal:", error);
      })
      .finally(() => {
        if (isMounted) setIsModelLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeCam]);

  // Akses Webcam
  useEffect(() => {
    if (activeCam !== "device") {
      if (videoRef.current) videoRef.current.srcObject = null;
      return undefined;
    }

    let isMounted = true;
    let cleanupStream;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (!isMounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        cleanupStream = () => mediaStream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        console.error("Gagal mengakses kamera:", error);
        window.alert("Gagal mengakses kamera. Pastikan Anda telah memberikan izin akses.");
        setActiveCam("Cam A-01");
      });

    return () => {
      isMounted = false;
      cleanupStream?.();
    };
  }, [activeCam, setActiveCam]);

  // Deteksi frame webcam dengan AI Backend (PyTorch Sliding Window + NMS) setiap 2.5 detik
  useEffect(() => {
    if (activeCam !== "device" || !isPlaying || !showOverlay) return undefined;

    let isCancelled = false;
    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4 || !video.videoWidth) return;

      const canvas = document.createElement("canvas");
      canvas.width = Math.min(640, video.videoWidth);
      canvas.height = Math.min(480, video.videoHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob || isCancelled) return;
        try {
          const res = await detectFrameWithAI(blob, { confThreshold: 0.65 });
          if (isCancelled) return;
          if (res?.detections && res.detections.length > 0) {
            setDetections(
              res.detections.map((d) => ({
                id: d.id,
                left: d.box_normalized.left,
                top: d.box_normalized.top,
                width: d.box_normalized.width,
                height: d.box_normalized.height,
                status: d.prediction === "Mature" ? "Matang" : d.prediction === "Immature" ? "Mentah" : "Busuk",
                confidence: Math.round(d.confidence),
                type: d.type,
              }))
            );
          }
        } catch {
          // Fallback lokal jika backend tidak merespons
        }
      }, "image/jpeg", 0.8);
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeCam, isPlaying, showOverlay]);

  const togglePlay = () => {
    if (activeCam === "device" && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
    setIsPlaying((playing) => !playing);
  };

  const changeCamera = (camera) => {
    if (camera === "device") setIsModelLoading(true);
    setActiveCam(camera);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || activeCam !== "device" || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const link = document.createElement("a");
    link.download = "cocoasense-snapshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const cameraLabel = activeCam === "device"
    ? "Kamera HP / Webcam"
    : `${activeCam} (${cameraList.find((camera) => camera.name === activeCam)?.block ?? "Blok A"})`;

  return (
    <section className="glass-card video-player" aria-label="Pemantauan kamera">
      <header className="video-topbar">
        <div className="video-header-actions">
          <div className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            <span>LIVE: {activeCam === "device" ? "Kamera HP/Webcam" : activeCam}</span>
          </div>
          <select
            className="glass-select camera-select"
            value={activeCam}
            onChange={(event) => changeCamera(event.target.value)}
            aria-label="Pilih kamera"
          >
            {cameraList.map((camera) => (
              <option key={camera.id || camera.name} value={camera.name}>
                {camera.name} ({camera.block})
              </option>
            ))}
            <option value="device">📷 Kamera HP / Webcam</option>
          </select>
        </div>
        {showOverlayControl && (
          <button
            className={cn("overlay-toggle", showOverlay && "is-active")}
            type="button"
            onClick={() => setShowOverlay((visible) => !visible)}
            disabled={activeCam === "device" && isModelLoading}
            aria-pressed={showOverlay}
          >
            <Settings2 size={14} aria-hidden="true" />
            AI Overlay
          </button>
        )}
      </header>

      <div className="video-stage" ref={stageRef}>
        {activeCam === "device" ? (
          <video ref={videoRef} autoPlay playsInline muted aria-label="Tayangan kamera langsung" />
        ) : streamAvailable ? (
          <img
            src={getCctvStreamUrl(activeCam)}
            alt={`Live CCTV ${activeCam}`}
            className="video-stream-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: isPlaying ? "block" : "none" }}
            onError={() => setStreamAvailable(false)}
            onLoad={() => setStreamAvailable(true)}
          />
        ) : (
          <div className="video-scene" aria-hidden="true" />
        )}

        <time className="timestamp-chip">{timestamp}</time>

        {activeCam !== "device" && (
          <div className="mock-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {streamAvailable ? (
              <>
                <Wifi size={12} color="#4ade80" />
                <span>Live Feed AI Backend (MJPEG Stream)</span>
              </>
            ) : (
              <>
                <WifiOff size={12} color="#facc15" />
                <span>Mode Simulasi (Backend Offline)</span>
              </>
            )}
          </div>
        )}

        {showOverlayControl && showOverlay && activeCam !== "device" && !streamAvailable && (
          <div className="bounding-box demo-box" aria-label="Contoh overlay deteksi Matang 96%">
            <span className="box-caption">Matang 96%</span>
            <span className="box-corner-right" />
            <span className="box-corner-left" />
          </div>
        )}

        {showOverlay && activeCam === "device" && detections.map((box) => (
          <div
            className={`bounding-box ${toneClass[box.type] || "bounding-box-gold"}`}
            key={box.id}
            style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
          >
            <span className="box-caption">{box.status} {box.confidence}%</span>
            <span className="box-corner-right" />
            <span className="box-corner-left" />
          </div>
        ))}

        <div className="video-controls">
          <button
            className="video-control"
            type="button"
            onClick={togglePlay}
            title={isPlaying ? "Jeda" : "Putar"}
            aria-label={isPlaying ? "Jeda" : "Putar"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="control-group">
            <button className="video-control" type="button" onClick={takeSnapshot} title="Ambil cuplikan" aria-label="Ambil cuplikan">
              <Camera size={16} />
            </button>
            <button
              className="video-control"
              type="button"
              onClick={() => stageRef.current?.requestFullscreen?.()}
              title="Layar penuh"
              aria-label="Layar penuh"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
      <span className="sr-only">{cameraLabel}</span>
    </section>
  );
}
