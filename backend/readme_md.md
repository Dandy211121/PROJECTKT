# Cocoa Ripeness Detection Backend (Ensemble & Sliding Window)

Backend API berbasis **FastAPI** dan **PyTorch** untuk klasifikasi kematangan buah kakao (*Immature*, *Mature*, *Overmature*) menggunakan metode **Ensemble Learning (ResNet18 + EfficientNet-B0)** dan teknik **Sliding Window Cropping** untuk mendeteksi wilayah buah pada gambar beresolusi tinggi.

---

## 🚀 Fitur Utama
- **Ensemble Model:** Menggabungkan probabilitas tebakan dari dua arsitektur terbaik (ResNet18 hasil oversampling & EfficientNet-B0) menggunakan *Soft Voting*.
- **Auto-Download Models:** Skrip otomatis mengunduh file bobot model `.pth` dari Google Drive saat pertama kali dijalankan.
- **Sliding Window API:** Memecah gambar resolusi besar (seperti 1920x1080) menjadi potongan-potongan kecil secara otomatis disertai filter latar belakang daun untuk mendeteksi lokasi buah.

---

## 🛠️ Persyaratan Sistem
- Python 3.10 atau 3.11
- Koneksi internet (untuk pengunduhan model awal dari Google Drive)

---

## 📦 Instalasi dan Menjalankan Proyek

### 1. Kloning atau Siapkan Struktur Folder
Pastikan struktur folder proyek Anda seperti ini:
```text
my_cocoa_backend/
├── main.py
└── README.md
```

### 2. Install Dependencies
Buka terminal/command prompt di dalam folder proyek, lalu install pustaka yang dibutuhkan:
```bash
pip install fastapi uvicorn torch torchvision pillow numpy gdown pyngrok
```

### 3. Konfigurasi Google Drive File ID
Buka file `main.py`, lalu pastikan Anda sudah memasukkan **File ID** Google Drive yang benar pada kamus `models_to_download`:
```python
models_to_download = {
    "best_resnet18_cocoa_oversampled.pth": "MASUKKAN_FILE_ID_RESNET18_ANDA",
    "best_efficientnet_b0_cocoa.pth": "MASUKKAN_FILE_ID_EFFNET_ANDA"
}
```

### 4. Menjalankan Server secara Lokal
Jalankan perintah berikut di terminal:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- Server lokal akan aktif di: `http://127.0.0.1:8000`
- Anda dapat membuka dokumentasi interaktif (Swagger UI) di browser melalui: **`http://127.0.0.1:8000/docs`**

---

## 🌐 Cara Melakukan Tunneling (Akses Publik / Google Colab)

Jika Anda menjalankan backend ini di **Google Colab** atau ingin mengaksesnya dari perangkat lain via internet, Anda memerlukan *tunneling tool* seperti **ngrok**.

### Menggunakan Google Colab & Ngrok:
Buat sebuah *cell* baru di Google Colab dan jalankan skrip berikut:

```python
# 1. Install pyngrok (jika belum ada)
!pip install pyngrok

# 2. Masukkan token auth ngrok Anda (daftar gratis di dashboard.ngrok.com)
from pyngrok import ngrok
ngrok.set_auth_token("MASUKKAN_NGROK_AUTHTOKEN_ANDA")

# 3. Jalankan server FastAPI di background thread
import uvicorn
from threading import Thread

def run_server():
    uvicorn.run("main:app", host="127.0.0.1", port=8000)

server_thread = Thread(target=run_server)
server_thread.start()

# 4. Buka tunnel publik ke port 8000
public_url = ngrok.connect(8000)
print("🔗 URL Publik Backend Anda:", public_url)
```

Salin **URL Publik** yang dihasilkan (contoh: `https://xxxx-xx.ngrok-free.app`), lalu gunakan URL tersebut sebagai endpoint pada aplikasi Frontend (Flutter / React Native / Web) Anda dengan menambahkan `/predict-sliding-window` di belakangnya.