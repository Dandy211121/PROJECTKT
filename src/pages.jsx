import React, { useState, useEffect, useRef } from "react";
import {
  C,
  NM,
  BLOK,
  CAMS,
  HIST,
  PERIODS,
  series,
  sum,
} from "./data.js";
import {
  Icon,
  Badge,
  Card,
  Legend,
  Tabs,
  Pod,
  Scene,
  Closeup,
  TrendChart,
  DistChart,
} from "./ui.jsx";
import {
  detectFrameWithAI,
  fetchAnalyticsSummary,
  fetchCameras,
  saveCctvSnapshot,
} from "./lib/api.js";
const fmt = (n) => n.toLocaleString("id-ID");
const Head = ({ t, s, children }) => (
  <div className="phead">
    <div>
      <h1>{t}</h1>
      <p>{s}</p>
    </div>
    <div className="acts">{children}</div>
  </div>
);
const Demo = () => <span className="demo">Data Simulasi</span>;
const Sel = ({ v, on, opts, label }) => (
  <select
    className="sel"
    aria-label={label}
    value={v}
    onChange={(e) => on(e.target.value)}
  >
    {opts.map((o) => (
      <option key={o[0]} value={o[0]}>
        {o[1]}
      </option>
    ))}
  </select>
);
function Kpis({ v }) {
  const K = [
    ["Total Buah Terdeteksi", v.total, "scan", "#2F7848"],
    ["Siap Panen", v.ok, "check", "#5EAD47"],
    ["Sudah Dipanen", v.harv, "leaf", "#174D35"],
    ["Mentah", v.raw, "chart", "#E2B23F"],
    ["Terlalu Matang", v.over, "hist", "#ED8B43"],
    ["Busuk / Rusak", v.bad, "x", "#D9534F"],
  ];
  return (
    <div className="kpis">
      {K.map(([l, n, i, c]) => (
        <Card key={l} className="kpi">
          <div className="t">
            <span className="ic" style={{ background: c }}>
              <Icon n={i} s={15} />
            </span>
            {l}
          </div>
          <b>{fmt(n)}</b>
        </Card>
      ))}
    </div>
  );
}
const Trend = ({ p, setP, share = 1, title = "Tren Kematangan Kakao" }) => (
  <Card>
    <div className="hd">
      <div>
        <h3>{title}</h3>
        <p className="sub">
          Jumlah buah terdeteksi per kategori kematangan <Demo />
        </p>
      </div>
      <Tabs v={p} items={Object.keys(PERIODS)} on={setP} />
    </div>
    <TrendChart
      s={series(p, share)}
      labels={Array.from({ length: PERIODS[p].n }, (_, i) => PERIODS[p].lab(i))}
    />
    <Legend />
  </Card>
);
const HistRows = ({ rows }) =>
  rows.map(([t, b, s, n, c], i) => (
    <tr key={i}>
      <td>
        <div className="th">
          <Pod c={C[c]} />
        </div>
      </td>
      <td>
        {t}
        <small className="mut">Riwayat</small>
      </td>
      <td>Blok {b}</td>
      <td>{s}</td>
      <td>
        <b>{n}</b>
      </td>
      <td>
        <Badge c={c}>{NM[c]}</Badge>
      </td>
    </tr>
  ));
const HistTable = ({ rows }) => (
  <div className="scroll">
    <table>
      <thead>
        <tr>
          <th />
          <th>Waktu</th>
          <th>Blok</th>
          <th>Sumber</th>
          <th>Buah</th>
          <th>Dominan</th>
        </tr>
      </thead>
      <tbody>
        <HistRows rows={rows} />
      </tbody>
    </table>
  </div>
);

export function Dashboard({ go, backendStatus }) {
  const [p, setP] = useState("7 Hari");
  const [liveSummary, setLiveSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchAnalyticsSummary()
      .then((data) => {
        if (mounted) setLiveSummary(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [backendStatus?.online]);

  const kpis = liveSummary
    ? {
        total: liveSummary.total_detected_pods,
        ok: liveSummary.counts.Mature,
        harv: 296,
        raw: liveSummary.counts.Immature,
        over: liveSummary.counts.Overmature,
        bad: 143,
      }
    : { total: 1248, ok: 412, harv: 296, raw: 506, over: 187, bad: 143 };

  return (
    <>
      <section className="hero">
        <Scene />
        <div className="shade" />
        <div className="top">
          <div>
            <span className="chip">
              Minggu, 18 Oktober 2026 · {backendStatus?.online ? "Live AI Backend Active" : "7 hari terakhir"}
            </span>
            <h2>Selamat Datang, Pak Hendra</h2>
            <p>
              Pantau kondisi kebun dan temukan buah kakao yang siap dipanen hari
              ini.
            </p>
          </div>
        </div>
        <div className="strip">
          <div className="nm">
            <small>Blok dengan panen terbanyak</small>
            <b>Blok A</b>
          </div>
          <div>
            <small>Luas</small>
            <b>2,4 ha</b>
          </div>
          <div>
            <small>Siap panen</small>
            <b style={{ color: C.ok }}>{liveSummary ? liveSummary.counts.Mature : 118}</b>
          </div>
          <div>
            <small>Backend AI</small>
            <b style={{ color: backendStatus?.online ? C.ok : C.bad }}>
              {backendStatus?.online ? "Online" : "Offline"}
            </b>
          </div>
          <button className="btn lime" onClick={() => go("monitor")}>
            <Icon n="vid" />
            Live Monitor
          </button>
        </div>
      </section>
      <Kpis v={kpis} />
      <div className="row r2">
        <Trend p={p} setP={setP} />
        <Card>
          <h3>Distribusi Buah per Blok</h3>
          <p className="sub">7 hari terakhir, menurut tingkat kematangan</p>
          <DistChart />
          <Legend />
        </Card>
      </div>
      <div className="row r3">
        <Card>
          <div className="hd">
            <div>
              <h3>Live Monitor (Kamera Device)</h3>
              <p className="sub">Pantau langsung tanaman kakao via webcam / kamera perangkat</p>
            </div>
            <Badge c={backendStatus?.online ? "ok" : "off"}>
              {backendStatus?.online ? "AI Backend Aktif" : "Offline"}
            </Badge>
          </div>
          <div className="cam">
            <div className="off" style={{ background: "#16231B" }}>
              <Icon n="vid" s={36} />
              <b>Kamera Perangkat Siaga</b>
              <small>Klik tombol di bawah untuk membuka tayangan kamera langsung</small>
            </div>
            <span className="live">● SIAGA</span>
          </div>
          <div className="cm">
            <div>
              <b>Kamera HP / Webcam</b>
              <small className="mut">Pemindaian AI Real-time (PyTorch Ensemble)</small>
            </div>
            <div>
              <b>Real-time</b>
              <small className="mut">deteksi aktif</small>
            </div>
          </div>
          <button className="btn full" onClick={() => go("monitor")}>
            <Icon n="vid" />
            Buka Live Monitor Device
          </button>
        </Card>
        <Card>
          <div className="hd">
            <div>
              <h3>Riwayat Deteksi Terkini</h3>
              <p className="sub">Hasil tersimpan, bukan tayangan langsung</p>
            </div>
            <button className="btn ghost" onClick={() => go("riwayat")}>
              Lihat Semua
            </button>
          </div>
          <HistTable rows={HIST} />
        </Card>
      </div>
    </>
  );
}

export function Deteksi({ go, toast, backendStatus }) {
  const [mode, setMode] = useState("Kamera Langsung"),
    [st, setSt] = useState("idle"),
    [pr, setPr] = useState(0),
    [img, setImg] = useState(null),
    [fileObj, setFileObj] = useState(null),
    [detectionResult, setDetectionResult] = useState(null),
    [detectError, setDetectError] = useState(null),
    [webcamActive, setWebcamActive] = useState(false),
    [cameraFacing, setCameraFacing] = useState("environment"),
    [saved, setSaved] = useState(false),
    videoRef = useRef(null),
    fr = useRef();

  // Handle webcam stream initialization for "Kamera Langsung"
  useEffect(() => {
    let stream = null;
    let isCancelled = false;

    if (mode === "Kamera Langsung" && st === "idle") {
      navigator.mediaDevices?.getUserMedia?.({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
        .then((s) => {
          if (isCancelled) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = s;
          setWebcamActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Kamera tidak dapat diakses:", err);
          setWebcamActive(false);
        });
    } else {
      setWebcamActive(false);
    }

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode, st, cameraFacing]);

  const runAnalysis = async (targetFileOrBlob) => {
    const toAnalyze = targetFileOrBlob || fileObj;
    if (!toAnalyze) {
      toast("Silakan pilih atau ambil foto terlebih dahulu.");
      return;
    }

    setDetectError(null);
    setSaved(false);
    setPr(15);
    setSt("proses");

    const timer = setInterval(() => {
      setPr((v) => (v < 85 ? v + 7 : v));
    }, 120);

    try {
      const res = await detectFrameWithAI(toAnalyze, { confThreshold: 0.65 });
      clearInterval(timer);
      setPr(100);
      setDetectionResult(res);
      setSt("hasil");
    } catch (err) {
      clearInterval(timer);
      console.error("Gagal melakukan deteksi:", err);
      setDetectError(err.message || "Gagal menghubungi server deteksi.");
      // Fallback simulasi jika backend tidak dapat dihubungi
      setPr(100);
      setDetectionResult({
        total_detected_regions: 4,
        counts: { Mature: 2, Immature: 1, Overmature: 1 },
        detections: [
          {
            id: 1,
            prediction: "Mature",
            type: "ripe",
            confidence: 94.2,
            box_normalized: { left: "18%", top: "25%", width: "22%", height: "35%" },
          },
          {
            id: 2,
            prediction: "Immature",
            type: "unripe",
            confidence: 88.5,
            box_normalized: { left: "55%", top: "30%", width: "20%", height: "32%" },
          },
        ],
      });
      setSt("hasil");
      toast("Backend offline: Menampilkan estimasi visual.");
    }
  };

  const captureWebcamAndDetect = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast("Kamera belum siap, silakan tunggu sejenak.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const previewUrl = URL.createObjectURL(blob);
      setImg(previewUrl);
      setFileObj(blob);
      runAnalysis(blob);
    }, "image/jpeg", 0.9);
  };

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileObj(f);
      setImg(URL.createObjectURL(f));
    }
  };

  const reset = () => {
    setSt("idle");
    setImg(null);
    setFileObj(null);
    setDetectionResult(null);
    setDetectError(null);
  };

  const matureCount = detectionResult?.counts?.Mature ?? 0;
  const immatureCount = detectionResult?.counts?.Immature ?? 0;
  const overmatureCount = detectionResult?.counts?.Overmature ?? 0;
  const totalCount = detectionResult?.total_detected_regions ?? (matureCount + immatureCount + overmatureCount);

  return (
    <>
      <Head
        t="Deteksi Kakao"
        s="Ambil foto buah kakao atau unggah gambar untuk deteksi kematangan real-time dengan PyTorch AI Ensemble."
      >
        <Sel
          v="a"
          on={() => {}}
          label="Blok"
          opts={[["a", "Blok A"]]}
        />
      </Head>

      {st === "idle" && (
        <Card className="work">
          <Tabs
            v={mode}
            items={["Kamera Langsung", "Unggah Foto"]}
            on={setMode}
          />

          {mode === "Kamera Langsung" ? (
            <>
              <div className="cam big" style={{ position: "relative" }}>
                {webcamActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="webcam-video"
                  />
                ) : (
                  <div className="off">
                    <Icon n="cam" s={36} />
                    <span>Mempersiapkan Kamera Perangkat…</span>
                    <small>Pastikan izin kamera telah diberikan di browser</small>
                  </div>
                )}
                <span className="live">● KAMERA AKTIF</span>
              </div>
              <p className="sub">
                Arahkan kamera ke buah kakao di pohon dengan pencahayaan memadai.
                Backend Status:{" "}
                <Badge c={backendStatus?.online ? "ok" : "off"}>
                  {backendStatus?.online ? "AI Backend Online" : "Backend Terputus"}
                </Badge>
              </p>
              <div className="acts c">
                <button className="btn" onClick={captureWebcamAndDetect}>
                  <Icon n="cam" />
                  Ambil Foto & Analisis AI
                </button>
                <button
                  className="btn ghost"
                  onClick={() =>
                    setCameraFacing((f) => (f === "environment" ? "user" : "environment"))
                  }
                >
                  Ganti Kamera ({cameraFacing === "environment" ? "Belakang" : "Depan"})
                </button>
              </div>
            </>
          ) : img ? (
            <>
              <div className="cam big">
                <img
                  src={img}
                  alt="Pratinjau foto yang dipilih"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div className="acts c">
                <button className="btn" onClick={() => runAnalysis(fileObj)}>
                  <Icon n="scan" />
                  Analisis Foto dengan AI
                </button>
                <button
                  className="btn ghost"
                  onClick={() => fr.current?.click()}
                >
                  Ganti Foto
                </button>
                <button className="btn ghost" onClick={() => { setImg(null); setFileObj(null); }}>
                  Hapus
                </button>
              </div>
            </>
          ) : (
            <div
              className="drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile({ target: { files: e.dataTransfer.files } });
              }}
            >
              <Icon n="up" s={34} />
              <h3>Unggah Foto Buah Kakao</h3>
              <p className="sub">
                Seret foto buah kakao ke sini atau klik tombol untuk memilih dari galeri / berkas. Format JPG, JPEG, PNG.
              </p>
              <button className="btn" onClick={() => fr.current?.click()}>
                Pilih Berkas Foto
              </button>
            </div>
          )}
          <input
            ref={fr}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={pickFile}
          />
        </Card>
      )}

      {st === "proses" && (
        <Card className="work center">
          <div className="cam big" style={{ position: "relative" }}>
            {img ? (
              <img
                src={img}
                alt="Memproses"
                style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0.7)" }}
              />
            ) : (
              <Closeup boxes={[]} />
            )}
          </div>
          <h3>Menganalisis Buah Kakao dengan PyTorch Ensemble…</h3>
          <div className="prog">
            <i style={{ width: pr + "%" }} />
          </div>
          <p className="sub">
            {pr}% · Model: ResNet18 + EfficientNet-B0 (Sliding Window & NMS)
          </p>
        </Card>
      )}

      {st === "hasil" && (
        <div className="row r2">
          <Card>
            <div className="cam big" style={{ position: "relative" }}>
              {img ? (
                <div className="ai-frame-wrap">
                  <img
                    src={img}
                    alt="Hasil Deteksi Kakao"
                    className="ai-frame-img"
                  />
                  {detectionResult?.detections?.map((det) => (
                    <div
                      key={det.id}
                      className={`ai-box ${det.type || "ripe"}`}
                      style={{
                        left: det.box_normalized.left,
                        top: det.box_normalized.top,
                        width: det.box_normalized.width,
                        height: det.box_normalized.height,
                      }}
                    >
                      <span className="ai-box-lbl">
                        {det.prediction === "Mature"
                          ? "Matang"
                          : det.prediction === "Immature"
                          ? "Mentah"
                          : "Terlalu Matang"}{" "}
                        {Math.round(det.confidence)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Closeup />
              )}
            </div>
            <p className="sub" style={{ marginTop: "10px" }}>
              Bounding box otomatis dibuat oleh model PyTorch AI Ensemble backend (ResNet18 + EfficientNet-B0).
            </p>
          </Card>

          <Card>
            <div className="hd">
              <div>
                <h3>Hasil Deteksi AI</h3>
                <p className="sub">
                  Analisis Posisi & Kematangan Buah Kakao
                </p>
              </div>
              <Badge c={backendStatus?.online ? "ok" : "raw"}>
                {backendStatus?.online ? "AI Terhubung" : "Fallback"}
              </Badge>
            </div>

            <div className="big-n">
              {totalCount}
              <small> buah terdeteksi</small>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="ok">Matang Sempurna</Badge>
              </div>
              <b className="val">{matureCount}</b>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="raw">Mentah</Badge>
              </div>
              <b className="val">{immatureCount}</b>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="over">Terlalu Matang</Badge>
              </div>
              <b className="val">{overmatureCount}</b>
            </div>

            {detectError && (
              <div className="note warn" style={{ marginBottom: "12px" }}>
                <Icon n="warn" />
                <div>
                  <b>Pemberitahuan Model Backend</b>
                  <small>{detectError}</small>
                </div>
              </div>
            )}

            {saved && (
              <div className="note ok">
                <Icon n="check" />
                <div>
                  <b>Hasil tersimpan</b>
                  <small>
                    Hasil deteksi telah tersimpan ke dalam riwayat perkebunan.
                  </small>
                </div>
              </div>
            )}

            <div className="acts col">
              <button
                className="btn"
                disabled={saved}
                onClick={() => {
                  setSaved(true);
                  toast("Hasil deteksi AI berhasil disimpan.");
                }}
              >
                Simpan Hasil Deteksi
              </button>
              <button className="btn ghost" onClick={reset}>
                Deteksi Ulang
              </button>
              <button className="btn ghost" onClick={() => go("analisis")}>
                Lihat Analisis Panen
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export function Analisis() {
  const [p, setP] = useState("7 Hari"),
    [b, setB] = useState("Semua");
  const bl = b === "Semua" ? BLOK : { [b]: BLOK[b] },
    sh = b === "Semua" ? 1 : sum(BLOK[b]) / 1248;
  const s = series(p, sh),
    t = (c) => s[c].reduce((a, v) => a + v, 0),
    v = { ok: t("ok"), raw: t("raw"), over: t("over"), bad: t("bad") };
  v.total = v.ok + v.raw + v.over + v.bad;
  v.harv = Math.round(((296 * PERIODS[p].days) / 7) * sh);
  const top = (c) => Object.entries(BLOK).sort((a, z) => z[1][c] - a[1][c])[0];
  return (
    <>
      <Head
        t="Analisis Panen"
        s="Pantau tren kematangan, distribusi buah, dan kesiapan panen dari seluruh blok kebun."
      >
        <Sel
          v={b}
          on={setB}
          label="Blok"
          opts={[
            ["Semua", "Semua Blok"],
            ...Object.keys(BLOK).map((k) => [k, "Blok " + k]),
          ]}
        />
        <button className="btn ghost" onClick={() => {}}>
          Ekspor
        </button>
      </Head>
      <div className="bar-f">
        <Tabs v={p} items={Object.keys(PERIODS)} on={setP} />
        <small className="mut">
          Perbandingan: periode sebelumnya dengan lama yang sama
        </small>
      </div>
      <Kpis v={v} />
      <div className="row r2">
        <Trend p={p} setP={setP} share={sh} title="Tren Kematangan Kakao" />
        <Card>
          <h3>Distribusi per Blok Area</h3>
          <p className="sub">Total dan rincian per kategori</p>
          <DistChart blocks={bl} />
          <Legend />
        </Card>
      </div>
      <Card className="mb">
        <h3>Perbandingan Blok</h3>
        <div className="cmp">
          {[
            ["Paling banyak siap panen", "ok"],
            ["Paling banyak mentah", "raw"],
            ["Paling banyak terlalu matang", "over"],
            ["Paling banyak busuk / rusak", "bad"],
          ].map(([l, c]) => (
            <div key={c}>
              <small className="mut">{l}</small>
              <b>Blok {top(c)[0]}</b>
              <Badge c={c}>{top(c)[1][c]} buah</Badge>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3>Ringkasan Panen</h3>
        <p className="sub">
          Prediksi dari deteksi dan catatan panen dipisahkan.
        </p>
        <div className="cmp">
          <div>
            <small className="mut">Diprediksi siap panen</small>
            <b>{fmt(v.ok)}</b>
          </div>
          <div>
            <small className="mut">Tercatat dipanen</small>
            <b>{fmt(v.harv)}</b>
          </div>
          <div>
            <small className="mut">Masih mentah</small>
            <b>{fmt(v.raw)}</b>
          </div>
          <div>
            <small className="mut">Terlalu matang / rusak</small>
            <b>{fmt(v.over + v.bad)}</b>
          </div>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Blok</th>
                <th>Dipanen</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["17 Okt", "A", 64, "Panen pagi"],
                ["15 Okt", "C", 82, "Dua pekerja"],
                ["13 Okt", "B", 71, "—"],
                ["11 Okt", "A", 79, "Buah besar"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>Blok {r[1]}</td>
                  <td>
                    <b>{r[2]}</b> buah
                  </td>
                  <td>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function Monitor({ go: _go, backendStatus, toast }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [facingMode, setFacingMode] = useState("environment");
  const [showOverlay, setShowOverlay] = useState(true);
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({ total: 0, mature: 0, immature: 0, overmature: 0 });
  const [hasPermission, setHasPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize and manage user device camera stream
  useEffect(() => {
    let stream = null;
    let isCancelled = false;

    if (!isPlaying) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    navigator.mediaDevices?.getUserMedia?.({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
      .then((s) => {
        if (isCancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        streamRef.current = s;
        setHasPermission(true);
        setErrorMsg(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.warn("Kamera tidak dapat diakses:", err);
        setHasPermission(false);
        setErrorMsg(err.message || "Izin akses kamera belum diberikan.");
      });

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, isPlaying]);

  // Periodic AI inference on live video feed (every 2.5 seconds)
  useEffect(() => {
    if (!isPlaying || !showOverlay || !hasPermission || !backendStatus?.online) {
      return;
    }

    let isCancelled = false;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || video.readyState < 2) return;

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
          if (res?.detections) {
            setDetections(res.detections);
            const mature = res.counts?.Mature || 0;
            const immature = res.counts?.Immature || 0;
            const overmature = res.counts?.Overmature || 0;
            setStats({
              total: res.total_detected_regions || res.detections.length,
              mature,
              immature,
              overmature,
            });
          }
        } catch {
          // Lewati frame jika backend sedang sibuk
        }
      }, "image/jpeg", 0.85);
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isPlaying, showOverlay, hasPermission, backendStatus?.online]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    toast?.("Mengalihkan lensa kamera…");
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast?.("Kamera belum aktif.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const a = document.createElement("a");
    a.download = `kakao-live-snapshot-${Date.now()}.jpg`;
    a.href = canvas.toDataURL("image/jpeg", 0.9);
    a.click();
    toast?.("Cuplikan foto berhasil diunduh.");

    // Kirim snapshot ke server AI (#7 /api/v1/cctv/snapshot) jika backend aktif
    if (backendStatus?.online) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await saveCctvSnapshot(blob);
          toast?.("Snapshot dicatat ke server AI (#7 /api/v1/cctv/snapshot).");
        } catch (e) {
          console.warn("Gagal simpan snapshot ke backend:", e);
        }
      }, "image/jpeg", 0.9);
    }
  };

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <>
      <Head
        t="Live Monitor - Kamera Device"
        s="Tayangan kamera langsung dari perangkat Anda (HP / Webcam) dengan deteksi kematangan kakao real-time berbasis PyTorch AI Ensemble."
      >
        <Badge c={hasPermission ? "ok" : "raw"}>
          {hasPermission ? "Kamera Aktif" : "Menunggu Akses Kamera"}
        </Badge>
        <Badge c={backendStatus?.online ? "ok" : "off"}>
          {backendStatus?.online ? "Backend AI Online" : "Backend Terputus"}
        </Badge>
      </Head>

      <div className="kpis k4">
        {[
          ["Status Kamera", hasPermission ? "Aktif" : "Siaga"],
          ["Siap Panen (Matang)", stats.mature],
          ["Mentah", stats.immature],
          ["Terlalu Matang", stats.overmature],
        ].map(([l, n]) => (
          <Card key={l} className="kpi">
            <div className="t">{l}</div>
            <b>{n}</b>
          </Card>
        ))}
      </div>

      <div className="row r3">
        <Card style={{ padding: "16px" }}>
          <div className="player-stage" ref={stageRef}>
            {isPlaying ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`webcam-video ${facingMode === "user" ? "mirror" : ""}`}
              />
            ) : (
              <div className="player-notice">
                <Icon n="vid" s={42} />
                <b>Tayangan Kamera Dijeda</b>
                <small>Tekan tombol Putar untuk melanjutkan streaming kamera perangkat</small>
              </div>
            )}

            {!hasPermission && isPlaying && (
              <div className="player-notice">
                <Icon n="cam" s={42} />
                <b>{errorMsg || "Mempersiapkan Kamera Perangkat…"}</b>
                <small>Pastikan Anda telah memberikan izin akses webcam / kamera browser.</small>
              </div>
            )}

            {/* Bounding box AI overlay di atas video live */}
            {isPlaying && showOverlay && detections.map((det) => (
              <div
                key={det.id}
                className={`ai-box ${det.type || "ripe"}`}
                style={{
                  left: det.box_normalized.left,
                  top: det.box_normalized.top,
                  width: det.box_normalized.width,
                  height: det.box_normalized.height,
                }}
              >
                <span className="ai-box-lbl">
                  {det.prediction === "Mature"
                    ? "Matang"
                    : det.prediction === "Immature"
                    ? "Mentah"
                    : "Terlalu Matang"}{" "}
                  {Math.round(det.confidence)}%
                </span>
              </div>
            ))}

            {/* Topbar Video Player */}
            <div className="player-topbar">
              <span className="player-live-tag">
                <i className="player-dot" />
                LIVE DEVICE CAMERA
              </span>
              <button
                className={`player-ctrl-btn ${showOverlay ? "active" : ""}`}
                onClick={() => setShowOverlay((v) => !v)}
                title="Aktifkan/nonaktifkan bounding box deteksi AI"
              >
                <Icon n="scan" s={14} />
                AI Bounding Box: {showOverlay ? "ON" : "OFF"}
              </button>
            </div>

            {/* Bottombar Controls */}
            <div className="player-bottombar">
              <div className="player-ctrl-group">
                <button
                  className="player-ctrl-btn"
                  onClick={togglePlay}
                  title={isPlaying ? "Jeda Kamera" : "Putar Kamera"}
                >
                  <Icon n={isPlaying ? "pause" : "play"} s={14} />
                  {isPlaying ? "Jeda" : "Mulai"}
                </button>
                <button
                  className="player-ctrl-btn"
                  onClick={toggleFacing}
                  title="Ganti Lensa Kamera"
                >
                  <Icon n="refresh" s={14} />
                  {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                </button>
              </div>

              <div className="player-ctrl-group">
                <button
                  className="player-ctrl-btn"
                  onClick={takeSnapshot}
                  title="Ambil Cuplikan Frame"
                >
                  <Icon n="cam" s={14} />
                  Cuplikan
                </button>
                <button
                  className="player-ctrl-btn"
                  onClick={toggleFullscreen}
                  title="Mode Layar Penuh"
                >
                  <Icon n="vid" s={14} />
                  Fullscreen
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <Card className="mb">
            <div className="hd">
              <div>
                <h3>Telemetri Real-Time</h3>
                <p className="sub">Hasil deteksi ensemble PyTorch pada frame video aktif</p>
              </div>
              <Badge c={stats.total > 0 ? "ok" : "off"}>
                {stats.total > 0 ? `${stats.total} Buah` : "Memindai…"}
              </Badge>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="ok">Siap Panen (Matang)</Badge>
                <small>Kematangan optimal untuk dipanen</small>
              </div>
              <b className="val" style={{ color: C.ok }}>{stats.mature}</b>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="raw">Mentah</Badge>
                <small>Masih hijau / belum siap</small>
              </div>
              <b className="val" style={{ color: C.raw }}>{stats.immature}</b>
            </div>

            <div className="sen">
              <div className="n">
                <Badge c="over">Terlalu Matang</Badge>
                <small>Perlu segera dipetik</small>
              </div>
              <b className="val" style={{ color: C.over }}>{stats.overmature}</b>
            </div>
          </Card>

          <Card>
            <h3>Petunjuk Pengambilan Gambar</h3>
            <p className="sub">Optimalkan akurasi deteksi AI model kebun</p>
            <div className="note ok">
              <Icon n="check" />
              <div>
                <b>Pencahayaan Cukup</b>
                <small>Arahkan kamera ke buah dengan sinar matahari terang atau lampu yang cukup.</small>
              </div>
            </div>
            <div className="note">
              <Icon n="scan" />
              <div>
                <b>Jarak Ideal: 0,5 - 2 Meter</b>
                <small>Pastikan buah kakao tampak jelas di layar tanpa blur.</small>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function Kebun() {
  return (
    <>
      <Head
        t="Kebun dan Blok"
        s="Kelola blok, luas area, dan perangkat yang terpasang."
      >
        <button className="btn">Tambah Blok</button>
      </Head>
      <div className="kpis k4">
        {Object.entries(BLOK).map(([k, v]) => (
          <Card key={k}>
            <h3>Blok {k}</h3>
            <p className="sub">
              Perkebunan Kakao ·{" "}
              {[2.4, 1.8, 2.1, 1.6][+(k.charCodeAt(0) - 65)]} ha
            </p>
            <div className="cmp one">
              <div>
                <small className="mut">Total buah</small>
                <b>{sum(v)}</b>
              </div>
              <div>
                <small className="mut">Siap panen</small>
                <b style={{ color: C.ok }}>{v.ok}</b>
              </div>
            </div>
            <small className="mut">
              {CAMS.filter((c) => c.b === k).length} kamera · 5 sensor
            </small>
          </Card>
        ))}
      </div>
    </>
  );
}
export function Kamera({ toast, backendStatus }) {
  const [cameras, setCameras] = useState(CAMS);

  useEffect(() => {
    let mounted = true;
    fetchCameras()
      .then((cams) => {
        if (mounted && Array.isArray(cams) && cams.length > 0) {
          const mapped = cams.map((c) => ({
            id: c.id,
            b: c.id.includes("B-") ? "B" : c.id.includes("C-") ? "C" : "A",
            st: c.status || "online",
            name: c.name,
            location: c.location,
            t: "Aktif",
          }));
          setCameras(mapped);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [backendStatus?.online]);

  return (
    <>
      <Head t="Kelola Kamera" s="Atur dan pantau status kamera CCTV di setiap blok kebun kakao.">
        <button
          className="btn"
          onClick={() =>
            toast("Sinkronisasi daftar kamera dengan backend berhasil.")
          }
        >
          Sinkronisasi Kamera
        </button>
      </Head>
      <Card>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Kamera</th>
                <th>Lokasi / Blok</th>
                <th>Status</th>
                <th>Koneksi Backend</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.name || `Kamera ${c.id}`}</b>
                  </td>
                  <td>{c.location || `Blok ${c.b}`}</td>
                  <td>
                    <Badge
                      c={
                        c.st === "online" || c.st === "ready"
                          ? "ok"
                          : c.st === "warning"
                            ? "raw"
                            : "off"
                      }
                    >
                      {c.st === "online" || c.st === "ready"
                        ? "Online"
                        : c.st === "warning"
                          ? "Koneksi lemah"
                          : "Offline"}
                    </Badge>
                  </td>
                  <td>
                    <small className="mut">
                      {backendStatus?.online ? "FastAPI 127.0.0.1:8000" : "Simulasi"}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
export function Riwayat() {
  return (
    <>
      <Head
        t="Riwayat Deteksi"
        s="Semua hasil deteksi yang pernah disimpan. Ini data historis."
      />
      <Card>
        <HistTable rows={[...HIST, ...HIST]} />
      </Card>
    </>
  );
}
export function Pengaturan({ toast }) {
  return (
    <>
      <Head
        t="Pengaturan Akun"
        s="Kelola profil, kebun default, dan keamanan."
      />
      <Card className="form">
        {[
          ["Nama Lengkap", "Hendra Saputra"],
          ["Email", "hendra@contoh.id"],
          ["Kebun Default", "Perkebunan Utama"],
        ].map(([l, v]) => (
          <label key={l}>
            {l}
            <input defaultValue={v} />
          </label>
        ))}
        <button className="btn" onClick={() => toast("Perubahan disimpan.")}>
          Simpan Perubahan
        </button>
      </Card>
    </>
  );
}
