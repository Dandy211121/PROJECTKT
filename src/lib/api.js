const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";

/**
 * Memeriksa status kesehatan backend
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, data };
  } catch {
    return { online: false };
  }
}

/**
 * Mengambil ringkasan analitik kematangan dari backend
 */
export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/api/v1/analytics/summary`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Gagal mengambil analitik: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Mengambil daftar kamera CCTV terdaftar dari backend
 */
export async function fetchCameras() {
  const res = await fetch(`${API_BASE_URL}/api/v1/cctv/cameras`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Gagal mengambil daftar kamera: ${res.statusText}`);
  }
  return res.json();
}

/**
 * URL endpoint live streaming video MJPEG teranotasi AI
 */
export function getCctvStreamUrl(cameraId) {
  return `${API_BASE_URL}/api/v1/cctv/stream/${encodeURIComponent(cameraId)}`;
}

/**
 * Mengirim gambar frame webcam/hp ke backend untuk deteksi ensemble PyTorch (Sliding Window + NMS)
 */
export async function detectFrameWithAI(imageBlob, {
  confThreshold = 0.70,
  iouThreshold = 0.35,
  cropSize = 280,
  stride = 140,
} = {}) {
  const formData = new FormData();
  formData.append("file", imageBlob, "frame.jpg");

  const query = new URLSearchParams({
    conf_threshold: String(confThreshold),
    iou_threshold: String(iouThreshold),
    crop_size: String(cropSize),
    stride: String(stride),
  });

  const res = await fetch(`${API_BASE_URL}/api/v1/detect/frame?${query.toString()}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Gagal deteksi frame: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Membuka koneksi WebSocket untuk menerima telemetri bounding box real-time dari kamera CCTV
 */
export function connectCameraWebSocket(cameraId, onData, onError) {
  let ws;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    try {
      ws = new WebSocket(`${WS_BASE_URL}/api/v1/cctv/ws/${encodeURIComponent(cameraId)}`);
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onData?.(parsed);
        } catch (e) {
          console.error("Gagal parse data telemetry WebSocket:", e);
        }
      };
      ws.onerror = (err) => {
        onError?.(err);
      };
      ws.onclose = () => {
        if (!isClosed) {
          // Reconnect otomatis setelah 3 detik
          setTimeout(connect, 3000);
        }
      };
    } catch (err) {
      onError?.(err);
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (ws) ws.close();
  };
}

export { API_BASE_URL, WS_BASE_URL };
