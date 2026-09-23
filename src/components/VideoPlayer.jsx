import { useState, useEffect, useRef } from 'react';
import { Camera, Pause, Play, Maximize, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export function VideoPlayer({ showOverlayControl = false }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeCam, setActiveCam] = useState('Cam A-01');
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [model, setModel] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const animationRef = useRef(null);

  const colorMap = {
    ripe: "border-amber-400 text-amber-400 bg-amber-400/20",
    unripe: "border-emerald-400 text-emerald-400 bg-emerald-400/20",
    overripe: "border-red-500 text-red-500 bg-red-500/20",
  };

  const statusMap = [
    { status: 'Matang', type: 'ripe' },
    { status: 'Mentah', type: 'unripe' },
    { status: 'Busuk', type: 'overripe' },
  ];

  // Load Model
  useEffect(() => {
    setIsModelLoading(true);
    cocoSsd.load().then((loadedModel) => {
      setModel(loadedModel);
      setIsModelLoading(false);
    }).catch(err => {
      console.error("Gagal memuat model AI:", err);
      setIsModelLoading(false);
    });
  }, []);

  // Handle switching to device camera
  useEffect(() => {
    if (activeCam === 'device') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.error("Gagal mengakses kamera:", err);
          alert("Gagal mengakses kamera. Pastikan Anda telah memberikan izin akses.");
          setActiveCam('Cam A-01');
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Reset detections when not using camera
      setDetections([]);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCam]);

  // Detection Loop
  useEffect(() => {
    const detectFrame = async () => {
      if (
        model && 
        activeCam === 'device' && 
        isPlaying && 
        showOverlay && 
        videoRef.current && 
        videoRef.current.readyState === 4
      ) {
        const video = videoRef.current;
        try {
          const predictions = await model.detect(video);
          
          // Calculate percentages based on video's original resolution
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          
          if (videoWidth > 0 && videoHeight > 0) {
            const mappedDetections = predictions
              // Filter out extremely low confidence to reduce flickering
              .filter(p => p.score > 0.5)
              .map((p, index) => {
                const [x, y, width, height] = p.bbox;
                const mockState = statusMap[index % 3];
                
                return {
                  id: index,
                  left: `${(x / videoWidth) * 100}%`,
                  top: `${(y / videoHeight) * 100}%`,
                  width: `${(width / videoWidth) * 100}%`,
                  height: `${(height / videoHeight) * 100}%`,
                  status: mockState.status,
                  confidence: Math.round(p.score * 100),
                  type: mockState.type,
                  className: p.class // optionally show the real class
                };
              });
            setDetections(mappedDetections);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      } else if (activeCam !== 'device') {
        // If not using device cam, clear detections or show static mock
        setDetections([]);
      }
      
      animationRef.current = requestAnimationFrame(detectFrame);
    };

    animationRef.current = requestAnimationFrame(detectFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [model, activeCam, isPlaying, showOverlay]);

  const togglePlay = () => {
    if (activeCam === 'device' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      {/* Header / Controls */}
      <div className="p-3 bg-white/80 border-b border-slate-200 flex justify-between items-center z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="relative flex h-2 w-2">
              {isPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
              <span className={cn("relative inline-flex rounded-full h-2 w-2", isPlaying ? "bg-red-500" : "bg-slate-400")}></span>
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
              LIVE: {activeCam === 'device' ? 'Kamera HP/Webcam' : activeCam}
            </span>
          </div>
          
          <select 
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-2 py-1.5 outline-none focus:border-emerald-500 shadow-sm"
            value={activeCam}
            onChange={(e) => setActiveCam(e.target.value)}
          >
            <option value="Cam A-01">Cam A-01 (Blok A)</option>
            <option value="Cam A-02">Cam A-02 (Blok A)</option>
            <option value="Cam B-01">Cam B-01 (Blok B)</option>
            <option value="Cam C-01">Cam C-01 (Blok C)</option>
            <option value="device">📷 Kamera HP / Webcam</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {isModelLoading && (
            <span className="text-xs text-slate-500 font-medium animate-pulse hidden md:block">
              Loading AI Model...
            </span>
          )}
          {showOverlayControl && (
            <button 
              onClick={() => setShowOverlay(!showOverlay)}
              disabled={isModelLoading}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                showOverlay 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                  : "bg-slate-50 text-slate-600 border-slate-200",
                isModelLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Settings2 className="w-4 h-4 hidden sm:block" />
              AI Overlay
            </button>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="relative flex-1 bg-black overflow-hidden group min-h-[300px] flex items-center justify-center">
        {activeCam === 'device' ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-fill"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1611843467160-25afb8cf1074?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70">
            <span className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">Kamera Statis (Mock) - Tidak Ada Deteksi Aktif</span>
          </div>
        )}
        
        {/* Timestamp */}
        <div className="absolute top-4 left-4 font-mono text-white/90 text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm z-20">
          {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}
        </div>


        {showOverlay && activeCam === 'device' && detections.map((box) => (
          <div 
            key={box.id}
            className={cn("absolute border-2 transition-all duration-75 z-10 pointer-events-none", colorMap[box.type])}
            style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
          >
            <div className="absolute -top-6 left-[-2px] bg-black/70 backdrop-blur-sm px-1.5 py-0.5 whitespace-nowrap text-xs font-semibold rounded-t flex gap-2">
              <span className="text-white">{box.status}</span>
              <span className="opacity-90">{box.confidence}%</span>
            </div>
          </div>
        ))}

        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center z-30">
          <button 
            onClick={togglePlay}
            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Snapshot">
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Fullscreen">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
