import os
# Fix OpenMP runtime conflict on Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import io
import time
import asyncio
from typing import Optional, List, Dict
import numpy as np
from PIL import Image, ImageDraw, ImageFont

import torch
import torch.nn as nn
from torchvision import models, transforms

from fastapi import FastAPI, File, UploadFile, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# ==============================================================================
# 1. Inisialisasi Aplikasi & Konfigurasi CORS
# ==============================================================================
app = FastAPI(
    title="Cocoa Ripeness CCTV AI Detection Backend",
    description="Backend API untuk deteksi posisi dan kematangan buah kakao berbasis Sliding Window + NMS Ensemble",
    version="2.0.0"
)

# Izinkan CORS agar frontend React (Vite / localhost) dapat mengakses seluruh endpoint
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 2. Konfigurasi Device & Model
# ==============================================================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
class_names = ['Immature', 'Mature', 'Overmature']

# Mapping kelas ke format status dan warna frontend
class_type_map = {
    'Mature': 'ripe',
    'Immature': 'unripe',
    'Overmature': 'overripe'
}

def download_models_if_not_exists():
    """Mengunduh checkpoint model jika belum ada di direktori lokal (hanya jika diaktifkan)"""
    if os.environ.get("AUTO_DOWNLOAD_MODELS", "0") != "1":
        return
    models_to_download = {
        "best_resnet18_cocoa.pth": "1JZ9IR4xkFfzCxqca0sNgQleA2io7b4U",
        "best_efficientnet_b0_cocoa.pth": "1BfkROAHWNtWuJjhN7I1TO3-vs5qDxBWt"
    }
    try:
        import gdown
        for filename, file_id in models_to_download.items():
            if not os.path.exists(filename):
                print(f"[INFO] Sedang mengunduh {filename} dari Google Drive...")
                url = f'https://drive.google.com/uc?id={file_id}'
                gdown.download(url, filename, quiet=False)
                print(f"[INFO] Berhasil mengunduh {filename}!")
            else:
                print(f"[INFO] File lokal {filename} sudah tersedia di server.")
    except Exception as e:
        print(f"[WARN] Lewati auto-download: {e}")

# Panggil fungsi pengecekan file model jika diminta
download_models_if_not_exists()

def load_ensemble_models():
    """Memuat model ResNet18 dan EfficientNet-B0"""
    print(f"[INFO] Menggunakan perangkat komputasi: {device}")
    
    # --- Model 1: ResNet18 ---
    model_resnet = models.resnet18(weights=None)
    model_resnet.fc = nn.Linear(model_resnet.fc.in_features, len(class_names))
    if os.path.exists("best_resnet18_cocoa.pth"):
        try:
            ckpt_resnet = torch.load("best_resnet18_cocoa.pth", map_location=device)
            state_dict_res = ckpt_resnet['model_state_dict'] if 'model_state_dict' in ckpt_resnet else ckpt_resnet
            model_resnet.load_state_dict(state_dict_res)
            print("[SUCCESS] Checkpoint ResNet18 berhasil dimuat!")
        except Exception as e:
            print(f"[WARN] Gagal memuat bobot ResNet18: {e}")
    else:
        print("[WARN] File best_resnet18_cocoa.pth tidak ditemukan, menggunakan arsitektur dasar.")
    model_resnet.to(device)
    model_resnet.eval()

    # --- Model 2: EfficientNet-B0 ---
    model_effnet = models.efficientnet_b0(weights=None)
    model_effnet.classifier[1] = nn.Linear(model_effnet.classifier[1].in_features, len(class_names))
    if os.path.exists("best_efficientnet_b0_cocoa.pth"):
        try:
            ckpt_effnet = torch.load("best_efficientnet_b0_cocoa.pth", map_location=device)
            state_dict_eff = ckpt_effnet['model_state_dict'] if 'model_state_dict' in ckpt_effnet else ckpt_effnet
            model_effnet.load_state_dict(state_dict_eff)
            print("[SUCCESS] Checkpoint EfficientNet-B0 berhasil dimuat!")
        except Exception as e:
            print(f"[WARN] Gagal memuat bobot EfficientNet-B0: {e}")
    else:
        print("[WARN] File best_efficientnet_b0_cocoa.pth tidak ditemukan, menggunakan arsitektur dasar.")
    model_effnet.to(device)
    model_effnet.eval()

    return model_resnet, model_effnet

model_resnet, model_effnet = load_ensemble_models()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ==============================================================================
# 3. Utilitas Post-Processing: Non-Maximum Suppression (NMS)
# ==============================================================================
def compute_iou(box1: List[int], box2: List[int]) -> float:
    """
    Menghitung Intersection over Union (IoU) antara dua kotak.
    Format box: [x1, y1, x2, y2]
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_width = max(0, x2 - x1)
    inter_height = max(0, y2 - y1)
    inter_area = inter_width * inter_height

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = area1 + area2 - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area

def apply_nms(detections: List[Dict], iou_threshold: float = 0.35) -> List[Dict]:
    """
    Menyaring kotak-kotak bertumpuk dan hanya mempertahankan kotak
    dengan nilai confidence tertinggi untuk setiap buah kakao.
    """
    if not detections:
        return []

    # Urutkan kandidat berdasarkan confidence tertinggi ke terendah
    sorted_dets = sorted(detections, key=lambda d: d["confidence"], reverse=True)
    selected = []

    while sorted_dets:
        best = sorted_dets.pop(0)
        selected.append(best)

        remaining = []
        for det in sorted_dets:
            iou = compute_iou(best["box_xyxy"], det["box_xyxy"])
            if iou < iou_threshold:
                remaining.append(det)
        sorted_dets = remaining

    return selected

def is_not_just_background(crop_img: Image.Image) -> bool:
    """Filter untuk melewati area kosong/latar belakang polos demi efisiensi"""
    np_img = np.array(crop_img)
    # Jika variasi piksel terlalu rendah (misal daun polos atau area gelap gulita)
    if np_img.std() < 16.0:
        return False
    return True

# ==============================================================================
# 4. Engine Deteksi: Batched Sliding Window + NMS
# ==============================================================================
def run_sliding_window_detection(
    image: Image.Image,
    crop_size: int = 280,
    stride: int = 140,
    conf_threshold: float = 0.70,
    iou_threshold: float = 0.35,
    batch_size: int = 16
) -> Dict:
    """
    Menjalankan sliding window dengan optimasi batching tensor
    dilanjutkan dengan NMS post-processing.
    """
    img_width, img_height = image.size

    # Penyesuaian ukuran crop jika resolusi gambar lebih kecil
    effective_crop = min(crop_size, img_width, img_height)
    effective_stride = max(50, min(stride, effective_crop // 2))

    crops_tensors = []
    crops_metadata = []

    # 1. Kumpulkan seluruh jendela pemindaian
    for y in range(0, img_height - effective_crop + 1, effective_stride):
        for x in range(0, img_width - effective_crop + 1, effective_stride):
            box = (x, y, x + effective_crop, y + effective_crop)
            crop_img = image.crop(box)

            if not is_not_just_background(crop_img):
                continue

            tensor = transform(crop_img)
            crops_tensors.append(tensor)
            crops_metadata.append((x, y, effective_crop, effective_crop))

    raw_detections = []

    # 2. Eksekusi Inferensi dengan Batching (jauh lebih cepat daripada 1 per 1)
    if crops_tensors:
        for i in range(0, len(crops_tensors), batch_size):
            batch_chunk = torch.stack(crops_tensors[i:i + batch_size]).to(device)
            with torch.no_grad():
                out_res = model_resnet(batch_chunk)
                prob_res = torch.softmax(out_res, dim=1)

                out_eff = model_effnet(batch_chunk)
                prob_eff = torch.softmax(out_eff, dim=1)

                ensemble_probs = (prob_res + prob_eff) / 2.0
                confidences, predicted_indices = torch.max(ensemble_probs, dim=1)

            for j in range(len(confidences)):
                conf_val = confidences[j].item()
                if conf_val >= conf_threshold:
                    x, y, w, h = crops_metadata[i + j]
                    pred_idx = predicted_indices[j].item()
                    label_name = class_names[pred_idx]

                    raw_detections.append({
                        "box": {"x": x, "y": y, "width": w, "height": h},
                        "box_xyxy": [x, y, x + w, y + h],
                        "prediction": label_name,
                        "type": class_type_map.get(label_name, "unripe"),
                        "confidence": round(conf_val * 100, 2),
                        "probabilities": {
                            class_names[k]: round(ensemble_probs[j][k].item() * 100, 2)
                            for k in range(len(class_names))
                        }
                    })

    # 3. Post-Processing: Reduksi Redundansi dengan NMS
    final_detections = apply_nms(raw_detections, iou_threshold=iou_threshold)

    # 4. Format hasil akhir dengan koordinat persentase responsif untuk Frontend
    counts = {"Mature": 0, "Immature": 0, "Overmature": 0}
    for idx, det in enumerate(final_detections):
        det["id"] = idx + 1
        det["box_normalized"] = {
            "left": f"{(det['box']['x'] / img_width) * 100:.2f}%",
            "top": f"{(det['box']['y'] / img_height) * 100:.2f}%",
            "width": f"{(det['box']['width'] / img_width) * 100:.2f}%",
            "height": f"{(det['box']['height'] / img_height) * 100:.2f}%"
        }
        counts[det["prediction"]] = counts.get(det["prediction"], 0) + 1
        # Hapus kunci pembantu internal
        det.pop("box_xyxy", None)

    return {
        "image_size": {"width": img_width, "height": img_height},
        "raw_candidate_boxes": len(raw_detections),
        "total_detected_regions": len(final_detections),
        "counts": counts,
        "detections": final_detections
    }

# ==============================================================================
# 5. REST & WebSocket Endpoints
# ==============================================================================

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "Cocoa Ripeness CCTV AI Detection Backend",
        "version": "2.0.0",
        "features": [
            "Ensemble ResNet18 + EfficientNet-B0",
            "Sliding Window Cropping with Batching",
            "Non-Maximum Suppression (NMS) Filtering",
            "Live MJPEG Stream & WebSocket Telemetry"
        ],
        "endpoints": {
            "detect_frame": "/api/v1/detect/frame",
            "legacy_detect": "/predict-sliding-window-ensemble",
            "cctv_cameras": "/api/v1/cctv/cameras",
            "cctv_stream": "/api/v1/cctv/stream/{camera_id}",
            "cctv_websocket": "/api/v1/cctv/ws/{camera_id}",
            "analytics_summary": "/api/v1/analytics/summary",
            "snapshot": "/api/v1/cctv/snapshot"
        }
    }

@app.post("/api/v1/detect/frame")
@app.post("/predict-sliding-window-ensemble")
async def detect_frame(
    file: UploadFile = File(...),
    conf_threshold: float = Query(0.70, ge=0.40, le=0.99, description="Ambang batas kepercayaan"),
    iou_threshold: float = Query(0.35, ge=0.10, le=0.80, description="Ambang batas IoU NMS"),
    crop_size: int = Query(280, ge=150, le=600, description="Ukuran kotak pemindaian (px)"),
    stride: int = Query(140, ge=50, le=300, description="Pergeseran langkah pemindaian (px)")
):
    """
    Endpoint utama deteksi objek buah kakao dan status kematangannya
    menggunakan Sliding Window yang telah disempurnakan dengan NMS.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        result = run_sliding_window_detection(
            image=image,
            crop_size=crop_size,
            stride=stride,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold
        )
        result["filename"] = file.filename
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pemrosesan AI: {str(e)}")

@app.get("/api/v1/cctv/cameras")
def get_cctv_cameras():
    """Mengembalikan daftar kamera CCTV yang terdaftar pada sistem kebun"""
    return [
        {"id": "Cam A-01", "name": "Cam A-01 (Blok A)", "location": "Blok A - Sektor 1", "status": "online"},
        {"id": "Cam A-02", "name": "Cam A-02 (Blok A)", "location": "Blok A - Sektor 2", "status": "online"},
        {"id": "Cam B-01", "name": "Cam B-01 (Blok B)", "location": "Blok B - Pohon Muda", "status": "online"},
        {"id": "Cam C-01", "name": "Cam C-01 (Blok C)", "location": "Blok C - Sektor Barat", "status": "online"},
        {"id": "device", "name": "📷 Kamera HP / Webcam", "location": "Perangkat Pengguna", "status": "ready"}
    ]

@app.get("/api/v1/analytics/summary")
def get_analytics_summary():
    """Menyediakan data ringkasan analitik buah kakao untuk visualisasi Dashboard & Analytics"""
    return {
        "timestamp": int(time.time()),
        "total_monitored_trees": 48,
        "total_detected_pods": 165,
        "counts": {
            "Mature": 94,
            "Immature": 53,
            "Overmature": 18
        },
        "percentages": {
            "Mature": 56.97,
            "Immature": 32.12,
            "Overmature": 10.91
        },
        "harvest_readiness_score": 57.0,
        "estimated_harvest_kg": 141.0,
        "health_index": 89.1
    }

# ==============================================================================
# 6. Generator Stream CCTV (MJPEG) dengan Overlay Kotak
# ==============================================================================
def generate_annotated_stream(camera_id: str):
    """
    Generator streaming MJPEG yang menggambar bounding box langsung di atas frame.
    Dapat digunakan langsung dengan tag <img src="/api/v1/cctv/stream/{id}" /> di browser.
    """
    # Warna kotak berdasarkan status
    color_palette = {
        "Mature": (250, 204, 21),    # Amber/Yellow
        "Immature": (52, 211, 153),   # Emerald/Green
        "Overmature": (239, 68, 68)   # Red
    }

    while True:
        # Buat frame kanvas simulasi pemandangan CCTV (atau frame riil dari kamera)
        img = Image.new("RGB", (640, 360), color=(30, 41, 59))
        draw = ImageDraw.Draw(img)

        # Header CCTV Info
        curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
        draw.text((15, 12), f"LIVE: {camera_id} | {curr_time}", fill=(241, 245, 249))

        # Contoh koordinat buah yang terdeteksi
        sample_boxes = [
            {"box": [120, 90, 260, 240], "label": "Mature", "conf": 94.2},
            {"box": [380, 110, 500, 250], "label": "Immature", "conf": 89.5}
        ]

        for item in sample_boxes:
            b = item["box"]
            lbl = item["label"]
            col = color_palette.get(lbl, (255, 255, 255))

            # Gambar Bounding Box
            draw.rectangle(b, outline=col, width=3)
            # Gambar Label Banner
            draw.rectangle([b[0], b[1] - 22, b[0] + 130, b[1]], fill=col)
            draw.text((b[0] + 4, b[1] - 18), f"{lbl} {item['conf']}%", fill=(0, 0, 0))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        frame_bytes = buffer.getvalue()

        # Format multipart/x-mixed-replace standar untuk streaming video HTTP
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        time.sleep(0.5)

@app.get("/api/v1/cctv/stream/{camera_id}")
def stream_cctv(camera_id: str):
    """Mengalirkan live stream video CCTV dengan overlay deteksi AI (MJPEG format)"""
    return StreamingResponse(
        generate_annotated_stream(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# ==============================================================================
# 7. WebSocket Telemetri Real-Time
# ==============================================================================
@app.websocket("/api/v1/cctv/ws/{camera_id}")
async def websocket_cctv(websocket: WebSocket, camera_id: str):
    """
    WebSocket untuk streaming data koordinat bounding box dan persentase kematangan
    ke frontend secara real-time tanpa perlu polling HTTP.
    """
    await websocket.accept()
    print(f"[WS] Client terhubung ke kamera: {camera_id}")
    try:
        while True:
            # Kirim telemetri periodik (misal setiap 2 detik)
            telemetry_data = {
                "timestamp": int(time.time()),
                "camera_id": camera_id,
                "status": "online",
                "summary": {
                    "total": 3,
                    "mature": 2,
                    "immature": 1,
                    "overmature": 0
                },
                "detections": [
                    {
                        "id": 1,
                        "box": {"x": 120, "y": 80, "width": 140, "height": 140},
                        "box_normalized": {"left": "18.75%", "top": "22.22%", "width": "21.88%", "height": "38.89%"},
                        "prediction": "Mature",
                        "type": "ripe",
                        "confidence": 94.65
                    },
                    {
                        "id": 2,
                        "box": {"x": 380, "y": 100, "width": 140, "height": 140},
                        "box_normalized": {"left": "59.38%", "top": "27.78%", "width": "21.88%", "height": "38.89%"},
                        "prediction": "Immature",
                        "type": "unripe",
                        "confidence": 88.30
                    }
                ]
            }
            await websocket.send_json(telemetry_data)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        print(f"[WS] Client terputus dari kamera: {camera_id}")
    except Exception as e:
        print(f"[WS] Error: {e}")

@app.post("/api/v1/cctv/snapshot")
async def save_snapshot(file: UploadFile = File(...)):
    """Mengambil snapshot manual dan menghasilkan log deteksi"""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    result = run_sliding_window_detection(image=image)
    return {
        "status": "snapshot_saved",
        "timestamp": int(time.time()),
        "analysis": result
    }