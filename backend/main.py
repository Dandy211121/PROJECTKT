import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import gdown

def download_models_if_not_exists():
    # Daftar file model dan Google Drive File ID masing-masing
    models_to_download = {
        "best_resnet18_cocoa.pth": "MASUKKAN_FILE_ID_RESNET18_DI_SINI",
        "best_efficientnet_b0_cocoa.pth": "MASUKKAN_FILE_ID_EFFNET_DI_SINI"
    }
    
    for filename, file_id in models_to_download.items():
        if not os.path.exists(filename):
            print(f"Sedang mengunduh {filename} dari Google Drive...")
            url = f'https://drive.google.com/uc?id={file_id}'
            gdown.download(url, filename, quiet=False)
            print(f"Berhasil mengunduh {filename}!")
        else:
            print(f"File lokal {filename} sudah tersedia di server.")

# Panggil fungsi ini di bagian atas file main.py sebelum fungsi load model dijalankan
download_models_if_not_exists()

app = FastAPI(title="Cocoa Sliding Window Ensemble API", version="1.0")

# 1. Konfigurasi Device & Kelas Target
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
class_names = ['Immature', 'Mature', 'Overmature']

# 2. Fungsi untuk Memuat Kedua Model (Ensemble)
def load_ensemble_models():
    # --- Model 1: ResNet18 (Oversampled) ---
    model_resnet = models.resnet18(weights=None)
    model_resnet.fc = nn.Linear(model_resnet.fc.in_features, len(class_names))
    try:
        ckpt_resnet = torch.load("best_resnet18_cocoa.pth", map_location=device)
        state_dict_res = ckpt_resnet['model_state_dict'] if 'model_state_dict' in ckpt_resnet else ckpt_resnet
        model_resnet.load_state_dict(state_dict_res)
        model_resnet.to(device)
        model_resnet.eval()
        print("Model ResNet18 berhasil dimuat!")
    except Exception as e:
        print(f"Gagal memuat ResNet18: {e}")

    # --- Model 2: EfficientNet-B0 ---
    model_effnet = models.efficientnet_b0(weights=None)
    model_effnet.classifier[1] = nn.Linear(model_effnet.classifier[1].in_features, len(class_names))
    try:
        ckpt_effnet = torch.load("best_efficientnet_b0_cocoa.pth", map_location=device)
        state_dict_eff = ckpt_effnet['model_state_dict'] if 'model_state_dict' in ckpt_effnet else ckpt_effnet
        model_effnet.load_state_dict(state_dict_eff)
        model_effnet.to(device)
        model_effnet.eval()
        print("Model EfficientNet-B0 berhasil dimuat!")
    except Exception as e:
        print(f"Gagal memuat EfficientNet-B0: {e}")

    return model_resnet, model_effnet

# Panggil fungsi load model saat server menyala
model_resnet, model_effnet = load_ensemble_models()

# 3. Transformasi standar untuk model
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def is_not_just_background(crop_img):
    """
    Filter Sederhana: Melewati area gambar yang terlalu monoton (latar belakang daun polos)
    untuk menghemat waktu komputasi.
    """
    np_img = np.array(crop_img)
    if np_img.std() < 15.0:
        return False
    return True

@app.get("/")
def home():
    return {"message": "API Sliding Window Ensemble (ResNet18 + EfficientNet-B0) Aktif!"}

@app.post("/predict-sliding-window-ensemble")
async def predict_sliding_window_ensemble(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")
    
    try:
        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_width, img_height = original_image.size
        
        # 4. Parameter Sliding Window
        crop_size = 300      # Ukuran kotak crop
        stride = 150         # Pergeseran 50% (overlapping)
        
        results = []
        
        # Proses pergeseran kotak (Sliding Window)
        for y in range(0, img_height - crop_size + 1, stride):
            for x in range(0, img_width - crop_size + 1, stride):
                box = (x, y, x + crop_size, y + crop_size)
                crop_img = original_image.crop(box)
                
                # Filter latar belakang kosong/polos
                if not is_not_just_background(crop_img):
                    continue
                
                # Transformasi hasil crop ke tensor
                input_tensor = transform(crop_img).unsqueeze(0).to(device)
                
                # 5. Inferensi Ensemble pada setiap Crop
                with torch.no_grad():
                    # Prediksi ResNet18
                    out_resnet = model_resnet(input_tensor)
                    prob_resnet = torch.nn.functional.softmax(out_resnet, dim=1)[0]
                    
                    # Prediksi EfficientNet-B0
                    out_effnet = model_effnet(input_tensor)
                    prob_effnet = torch.nn.functional.softmax(out_effnet, dim=1)[0]
                    
                    # Soft Voting Ensemble (Rata-rata probabilitas kedua model)
                    ensemble_probs = (prob_resnet + prob_effnet) / 2.0
                    
                    # Ambil nilai tertinggi dari hasil ensemble
                    confidence, predicted_idx = torch.max(ensemble_probs, 0)
                
                conf_score = confidence.item()
                
                # Threshold Kepercayaan (Hanya ambil yang keyakinannya di atas 70%)
                if conf_score > 0.70:
                    results.append({
                        "box": {"x": x, "y": y, "width": crop_size, "height": crop_size},
                        "prediction": class_names[predicted_idx.item()],
                        "confidence": round(conf_score * 100, 2),
                        "probabilities": {
                            class_names[i]: round(ensemble_probs[i].item() * 100, 2) 
                            for i in range(len(class_names))
                        }
                    })
                    
        return {
            "filename": file.filename,
            "total_detected_regions": len(results),
            "detections": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pada server: {str(e)}")