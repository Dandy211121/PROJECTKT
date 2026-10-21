const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";

/**
 * Memeriksa status kesehatan backend FastAPI
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

/**
 * Mengambil ringkasan analitik kematangan dari backend
 */
export async function fetchAnalyticsSummary() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(`${API_BASE_URL}/api/v1/analytics/summary`, {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  if (!res.ok) {
    throw new Error(`Gagal mengambil analitik: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Mengambil daftar kamera CCTV terdaftar dari backend
 */
export async function fetchCameras() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(`${API_BASE_URL}/api/v1/cctv/cameras`, {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  if (!res.ok) {
    throw new Error(`Gagal mengambil daftar kamera: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Mendapatkan URL live streaming video CCTV MJPEG teranotasi AI
 */
export function getCctvStreamUrl(cameraId) {
  return `${API_BASE_URL}/api/v1/cctv/stream/${encodeURIComponent(cameraId)}`;
}

/**
 * Mengirim gambar frame webcam atau foto file ke backend untuk deteksi ensemble PyTorch (Sliding Window + NMS)
 */
export async function detectFrameWithAI(imageBlobOrFile, {
  confThreshold = 0.70,
  iouThreshold = 0.35,
  cropSize = 280,
  stride = 140,
} = {}) {
  const formData = new FormData();
  formData.append("file", imageBlobOrFile, "frame.jpg");

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
    const errorText = await res.text();
    throw new Error(`Gagal deteksi frame: ${res.statusText} (${errorText})`);
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
          console.error("Gagal memproses data telemetry WebSocket:", e);
        }
      };
      ws.onerror = (err) => {
        onError?.(err);
      };
      ws.onclose = () => {
        if (!isClosed) {
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
