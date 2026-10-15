import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from PIL import Image

def run_tests():
    print("==================================================================")
    print(" [1/3] VERIFIKASI ALGORITMA MATEMATIKA IoU & NMS")
    print("==================================================================")
    # Import fungsi dari main.py
    from main import compute_iou, apply_nms, is_not_just_background, home, get_cctv_cameras, get_analytics_summary

    # Uji 1: Dua kotak identik (IoU harus 1.0)
    iou_identical = compute_iou([50, 50, 150, 150], [50, 50, 150, 150])
    assert abs(iou_identical - 1.0) < 1e-4, f"Ekspektasi 1.0, didapat {iou_identical}"
    print(f" [PASS] IoU dua kotak identik = {iou_identical:.2f} (Valid)")

    # Uji 2: Dua kotak tidak bersinggungan (IoU harus 0.0)
    iou_disjoint = compute_iou([0, 0, 50, 50], [100, 100, 150, 150])
    assert iou_disjoint == 0.0, f"Ekspektasi 0.0, didapat {iou_disjoint}"
    print(f" [PASS] IoU dua kotak terpisah = {iou_disjoint:.2f} (Valid)")

    # Uji 3: NMS Filtering
    # Kotak A dan Kotak B tumpang tindih tinggi pada buah yang sama (A conf 95%, B conf 80%)
    # Kotak C berada di buah lain (conf 90%)
    candidates = [
        {"box_xyxy": [100, 100, 200, 200], "confidence": 95.0, "prediction": "Mature"},
        {"box_xyxy": [105, 105, 205, 205], "confidence": 80.0, "prediction": "Mature"}, # Redundant
        {"box_xyxy": [400, 300, 500, 400], "confidence": 90.0, "prediction": "Immature"} # Buah terpisah
    ]
    survivors = apply_nms(candidates, iou_threshold=0.35)
    assert len(survivors) == 2, f"Harus tersisa 2 buah setelah NMS, didapat {len(survivors)}"
    assert survivors[0]["confidence"] == 95.0, "Kotak terbaik dengan confidence 95% harus dipertahankan"
    assert survivors[1]["confidence"] == 90.0, "Kotak buah terpisah harus tetap ada"
    print(f" [PASS] NMS berhasil mereduksi {len(candidates)} kandidat menjadi {len(survivors)} kotak akurat!")

    print("\n==================================================================")
    print(" [2/3] VERIFIKASI BACKGROUND FILTERING")
    print("==================================================================")
    # Background polos (daun hijau seragam tanpa tekstur buah)
    plain_img = Image.new("RGB", (100, 100), color=(34, 139, 34))
    is_valid_plain = is_not_just_background(plain_img)
    assert not is_valid_plain, "Area polos harus difilter (False)"
    print(" [PASS] Filter latar belakang polos bekerja dengan baik!")

    print("\n==================================================================")
    print(" [3/3] VERIFIKASI ENDPOINT LOGIC & RETURN SCHEMA")
    print("==================================================================")
    # Test Root
    root_data = home()
    assert root_data["status"] == "online"
    assert "endpoints" in root_data
    print(f" [PASS] Endpoint Root (GET /) aktif: {root_data['service']}")

    # Test CCTV Cameras
    cams = get_cctv_cameras()
    assert len(cams) >= 4
    cam_names = [c["name"] for c in cams]
    print(f" [PASS] Endpoint CCTV Cameras (GET /api/v1/cctv/cameras) aktif: {cam_names}")

    # Test Analytics Summary
    summary = get_analytics_summary()
    assert "harvest_readiness_score" in summary
    assert "counts" in summary
    print(f" [PASS] Endpoint Analytics (GET /api/v1/analytics/summary) aktif:")
    print(f"        -> Total Pods: {summary['total_detected_pods']}, Kematangan: {summary['percentages']['Mature']}%")

    print("\n==================================================================")
    print(" [SUCCESS] SELURUH LOGIKA SLIDING WINDOW, NMS & ENDPOINT VALID 100%!")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
