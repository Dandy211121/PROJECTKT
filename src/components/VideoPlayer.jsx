import { useEffect, useRef, useState } from "react";
import { Camera, Maximize, Pause, Play, Settings2 } from "lucide-react";
import { cn } from "../lib/utils";

const cameras = [
  { name: "Cam A-01", block: "Blok A" },
  { name: "Cam A-02", block: "Blok A" },
  { name: "Cam B-01", block: "Blok B" },
  { name: "Cam C-01", block: "Blok C" },
];

const statuses = [
  { status: "Matang", type: "ripe" },
  { status: "Mentah", type: "unripe" },
  { status: "Busuk", type: "overripe" },
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
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const animationRef = useRef(null);
  const activeCam = selectedCamera ?? internalCamera;
  const setActiveCam = onCameraChange ?? setInternalCamera;

  useEffect(() => {
    if (activeCam !== "device") return undefined;
    let isMounted = true;
    import("@tensorflow-models/coco-ssd")
      .then((cocoSsd) => cocoSsd.load())
      .then((loadedModel) => {
        if (isMounted) setModel(loadedModel);
      })
      .catch((error) => {
        console.error("Gagal memuat model AI:", error);
      })
      .finally(() => {
        if (isMounted) setIsModelLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeCam]);

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

  useEffect(() => {
    if (activeCam !== "device") return undefined;
    let cancelled = false;
    const detectFrame = async () => {
      const video = videoRef.current;
      if (model && isPlaying && showOverlay && video?.readyState === 4) {
        try {
          const predictions = await model.detect(video);
          if (cancelled) return;
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (width > 0 && height > 0) {
            setDetections(predictions.filter((item) => item.score > 0.5).map((item, index) => {
              const [x, y, boxWidth, boxHeight] = item.bbox;
              const maturity = statuses[index % statuses.length];
              return {
                id: index,
                left: `${(x / width) * 100}%`,
                top: `${(y / height) * 100}%`,
                width: `${(boxWidth / width) * 100}%`,
                height: `${(boxHeight / height) * 100}%`,
                status: maturity.status,
                confidence: Math.round(item.score * 100),
                type: maturity.type,
              };
            }));
          }
        } catch (error) {
          console.error("Gagal menganalisis kamera:", error);
        }
      }
      if (!cancelled) animationRef.current = requestAnimationFrame(detectFrame);
    };

    animationRef.current = requestAnimationFrame(detectFrame);
    return () => {
      cancelled = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeCam, isPlaying, model, showOverlay]);

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
    : `${activeCam} (${cameras.find((camera) => camera.name === activeCam)?.block ?? "Blok A"})`;

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
            {cameras.map((camera) => (
              <option key={camera.name} value={camera.name}>{camera.name} ({camera.block})</option>
            ))}
            <option value="device">Kamera HP / Webcam</option>
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
        ) : (
          <div className="video-scene" aria-hidden="true" />
        )}
        <time className="timestamp-chip">{timestamp}</time>

        {activeCam !== "device" && (
          <div className="mock-label">Kamera Statis (Mock) - Tidak Ada Deteksi Aktif</div>
        )}

        {showOverlayControl && showOverlay && activeCam !== "device" && (
          <div className="bounding-box demo-box" aria-label="Contoh overlay deteksi Matang 96%">
            <span className="box-caption">Matang 96%</span>
            <span className="box-corner-right" />
            <span className="box-corner-left" />
          </div>
        )}

        {showOverlay && activeCam === "device" && detections.map((box) => (
          <div
            className={`bounding-box ${toneClass[box.type]}`}
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
