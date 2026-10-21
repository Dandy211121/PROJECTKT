# Cocoa Ripeness CCTV AI Detection Backend (Ensemble + Sliding Window + NMS)

Backend API berbasis **FastAPI** dan **PyTorch** untuk deteksi objek dan klasifikasi tingkat kematangan buah kakao (*Immature*, *Mature*, *Overmature*) menggunakan metode **Ensemble Learning (ResNet18 + EfficientNet-B0)**, teknik **Batched Sliding Window**, serta post-processing **Non-Maximum Suppression (NMS)** untuk menghilangkan kotak bertumpuk pada pemantauan kamera CCTV kebun kakao.

---

## 🚀 Fitur Utama

1. **Batched Sliding Window Optimization**: Memecah gambar resolusi tinggi menjadi sub-jendela dengan eksekusi *batch tensor* (3x–5x lebih cepat dibanding per-crop).
2. **Post-Processing NMS (Non-Maximum Suppression)**: Menghitung *Intersection over Union* (IoU) secara otomatis untuk menyaring kotak redundan dan hanya mempertahankan 1 bounding box terbaik per buah kakao.
3. **Koordinat Responsif untuk Frontend**: Menyediakan koordinat piksel `(x, y, width, height)` serta koordinat persentase ternormalisasi `(left, top, width, height)` agar frontend React/HTML dapat langsung merender bounding box tanpa perhitungan manual.
4. **CORS Enabled**: Sudah dilengkapi CORS middleware sehingga dapat dihubungkan langsung ke antarmuka web (Vite React / Mobile).
5. **Dukungan Multi-Protokol**: Menyediakan REST API, Live MJPEG Video Stream (`multipart/x-mixed-replace`), dan WebSocket Telemetry real-time.

---

## 📡 Panduan Uji Endpoint API (Swagger UI & Client)

| # | Endpoint | Cara Uji | Input |
| :-: | :--- | :--- | :--- |
| 1 | `GET /` | Try it out → Execute langsung | Tidak ada |
| 2 | `POST /api/v1/detect/frame` ⭐ | Upload foto kakao + atur parameter | File gambar `.jpg` / `.png` |
| 3 | `POST /predict-sliding-window-ensemble` | Sama dengan #2 | File gambar |
| 4 | `GET /api/v1/cctv/cameras` | Execute langsung | Tidak ada |
| 5 | `GET /api/v1/cctv/stream/{camera_id}` | ⚠️ Buka di **tab browser baru** | URL langsung |
| 6 | `GET /api/v1/analytics/summary` | Execute langsung | Tidak ada |
| 7 | `POST /api/v1/cctv/snapshot` | Upload foto kakao | File gambar |
| 8 | `WS /api/v1/cctv/ws/{camera_id}` | ⚠️ Gunakan **Browser Console / Hoppscotch** | Tidak ada |

---

## 🛠️ Parameter Deteksi (`/api/v1/detect/frame`)

* `file`: File gambar (multipart/form-data)
* `conf_threshold` *(default: 0.70)*: Ambang batas keyakinan model (hanya buah dengan keyakinan $\ge 70\%$ yang lolos).
* `iou_threshold` *(default: 0.35)*: Ambang batas overlap NMS (jika dua kotak bertumpuk lebih dari 35%, kotak dengan confidence lebih rendah akan dieliminasi).
* `crop_size` *(default: 280)*: Ukuran jendela geser (piksel).
* `stride` *(default: 140)*: Langkah pergeseran jendela (piksel).

---

## 📦 Menjalankan Server secara Lokal

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Jalankan server FastAPI
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

* Server aktif di: `http://127.0.0.1:8000`
* Dokumentasi Interaktif (Swagger UI): `http://127.0.0.1:8000/docs`