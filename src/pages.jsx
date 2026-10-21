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
  sensors,
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
  Sensors,
} from "./ui.jsx";
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

export function Dashboard({ go }) {
  const [p, setP] = useState("7 Hari");
  return (
    <>
      <section className="hero">
        <Scene />
        <div className="shade" />
        <div className="top">
          <div>
            <span className="chip">
              Minggu, 18 Oktober 2026 · 7 hari terakhir
            </span>
            <h2>Selamat Datang, Pak Hendra</h2>
            <p>
              Pantau kondisi kebun dan temukan buah kakao yang siap dipanen hari
              ini.
            </p>
          </div>
          <div className="glass">
            {[
              ["Suhu", "29°C"],
              ["Kelembapan Tanah", "68%"],
              ["Curah Hujan", "12 mm"],
            ].map(([a, b]) => (
              <div key={a}>
                <small>{a}</small>
                <b>{b}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="strip">
          <div className="nm">
            <small>Blok dengan panen terbanyak</small>
            <b>Blok A · Kebun Sumber Rejeki</b>
          </div>
          <div>
            <small>Luas</small>
            <b>2,4 ha</b>
          </div>
          <div>
            <small>Siap panen</small>
            <b style={{ color: C.ok }}>118</b>
          </div>
          <div>
            <small>Kamera aktif</small>
            <b>2 dari 2</b>
          </div>
          <button className="btn lime" onClick={() => go("deteksi")}>
            <Icon n="scan" />
            Deteksi Kakao
          </button>
        </div>
      </section>
      <Kpis
        v={{ total: 1248, ok: 412, harv: 296, raw: 506, over: 187, bad: 143 }}
      />
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
              <h3>Kamera Kebun</h3>
              <p className="sub">Pratinjau kamera terpasang</p>
            </div>
            <Badge c="ok">Online</Badge>
          </div>
          <div className="cam">
            <Closeup />
            <span className="live">● LIVE</span>
          </div>
          <div className="cm">
            <div>
              <b>Kamera Blok A-01</b>
              <small className="mut">Blok A · Diperbarui 08:02 WIB</small>
            </div>
            <div>
              <b>9 buah</b>
              <small className="mut">di frame</small>
            </div>
          </div>
          <button className="btn full" onClick={() => go("monitor")}>
            Buka Live Monitor
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
      <div className="row r4">
        <Card>
          <div className="hd">
            <div>
              <h3>Kondisi Lingkungan Kebun</h3>
              <p className="sub">
                Sensor Blok A, terpisah dari hasil deteksi buah
              </p>
            </div>
            <Demo />
          </div>
          <Sensors list={sensors("A")} />
        </Card>
        <Card>
          <h3>Perlu Perhatian</h3>
          <p className="sub">Peringatan aktif</p>
          <div className="note warn">
            <Icon n="warn" />
            <div>
              <b>14 buah terlalu matang di Blok C</b>
              <small>Segera panen agar kualitas biji tidak turun.</small>
            </div>
          </div>
          <div className="note">
            <Icon n="bell" />
            <div>
              <b>Kamera D-01 offline</b>
              <small>
                Terakhir terhubung kemarin 16:20. Periksa daya dan jaringan.
              </small>
            </div>
          </div>
          <div className="note ok">
            <Icon n="check" />
            <div>
              <b>Sinkronisasi berhasil</b>
              <small>Data terakhir diperbarui 08:02 WIB.</small>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function Deteksi({ go, toast }) {
  const [mode, setMode] = useState("Kamera Langsung"),
    [st, setSt] = useState("idle"),
    [pr, setPr] = useState(0),
    [img, setImg] = useState(null),
    [saved, setSaved] = useState(false),
    fr = useRef();
  useEffect(() => {
    if (st !== "proses") return;
    const t = setInterval(
      () =>
        setPr((v) => {
          if (v >= 100) {
            clearInterval(t);
            setSt("hasil");
            return 100;
          }
          return v + 5;
        }),
      120,
    );
    return () => clearInterval(t);
  }, [st]);
  const run = () => {
      setPr(0);
      setSaved(false);
      setSt("proses");
    },
    reset = () => {
      setSt("idle");
      setImg(null);
    };
  const pick = (e) => {
    const f = e.target.files?.[0];
    if (f) setImg(URL.createObjectURL(f));
  };
  const res = { ok: 5, raw: 3, over: 1, bad: 1 };
  return (
    <>
      <Head
        t="Deteksi Kakao"
        s="Ambil foto buah kakao atau unggah gambar untuk mengetahui tingkat kematangannya."
      >
        <Sel
          v="a"
          on={() => {}}
          label="Blok"
          opts={[["a", "Blok A · Kebun Sumber Rejeki"]]}
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
              <div className="cam big">
                <Closeup boxes={[]} />
                <span className="live">● Pratinjau Simulasi</span>
              </div>
              <p className="sub">
                Posisikan buah kakao di tengah bingkai dengan cahaya yang cukup.
                Izin kamera: <Badge c="ok">Diizinkan</Badge>
              </p>
              <div className="acts c">
                <button className="btn" onClick={run}>
                  <Icon n="cam" />
                  Ambil Foto
                </button>
                <button
                  className="btn ghost"
                  onClick={() => toast("Kamera belakang dipilih (simulasi).")}
                >
                  Ganti Kamera
                </button>
              </div>
            </>
          ) : img ? (
            <>
              <div className="cam big">
                <img
                  src={img}
                  alt="Pratinjau foto"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="acts c">
                <button className="btn" onClick={run}>
                  Analisis Foto
                </button>
                <button
                  className="btn ghost"
                  onClick={() => fr.current.click()}
                >
                  Ganti
                </button>
                <button className="btn ghost" onClick={() => setImg(null)}>
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
                pick({ target: { files: e.dataTransfer.files } });
              }}
            >
              <Icon n="up" s={34} />
              <h3>Unggah Foto Buah Kakao</h3>
              <p className="sub">
                Seret foto ke sini atau pilih dari perangkat. Format JPG, JPEG,
                PNG · maks. 10 MB.
              </p>
              <button className="btn" onClick={() => fr.current.click()}>
                Pilih Foto
              </button>
            </div>
          )}
          <input
            ref={fr}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={pick}
          />
        </Card>
      )}
      {st === "proses" && (
        <Card className="work center">
          <div className="cam big">
            <Closeup boxes={[]} />
          </div>
          <h3>Sedang Menganalisis Buah Kakao…</h3>
          <div className="prog">
            <i style={{ width: pr + "%" }} />
          </div>
          <p className="sub">
            {pr}% · simulasi, tidak memakai model deteksi sungguhan
          </p>
        </Card>
      )}
      {st === "hasil" && (
        <div className="row r2">
          <Card>
            <div className="cam big">
              <Closeup />
            </div>
            <p className="sub">
              Kotak dan label contoh; skor kepercayaan ditampilkan pada setiap
              buah.
            </p>
          </Card>
          <Card>
            <h3>Hasil Deteksi</h3>
            <p className="sub">
              Blok A · 18 Okt 2026, 08:14 WIB <Demo />
            </p>
            <div className="big-n">
              10<small> buah terdeteksi</small>
            </div>
            {Object.entries(res).map(([c, n]) => (
              <div className="sen" key={c}>
                <div className="n">
                  <Badge c={c}>{NM[c]}</Badge>
                </div>
                <b className="val">{n}</b>
              </div>
            ))}
            {saved && (
              <div className="note ok">
                <Icon n="check" />
                <div>
                  <b>Hasil tersimpan</b>
                  <small>
                    Ditambahkan ke riwayat dan analisis. Ini bukan catatan
                    panen.
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
                  toast("Hasil deteksi disimpan.");
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
    share = (sum(bl[Object.keys(bl)[0]]) * (b === "Semua" ? 0 : 1)) / 1248 || 1,
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

export function Monitor({ go }) {
  const [b, setB] = useState("A");
  const on = CAMS.filter((c) => c.st === "online").length;
  return (
    <>
      <Head
        t="Live Monitor"
        s="Pantau kamera dan kondisi lingkungan dari setiap blok perkebunan kakao."
      />
      <div className="kpis k5">
        {[
          ["Total Kamera", CAMS.length],
          ["Kamera Online", on],
          ["Kamera Offline", 1],
          ["Blok Dipantau", 4],
          ["Peringatan Aktif", 3],
        ].map(([l, n]) => (
          <Card key={l} className="kpi">
            <div className="t">{l}</div>
            <b>{n}</b>
          </Card>
        ))}
      </div>
      <div className="row r2">
        <div className="camgrid">
          {CAMS.map((c) => (
            <Card key={c.id} className="cc">
              <div className="cam">
                {c.st === "offline" ? (
                  <div className="off">
                    <Icon n="vid" s={28} />
                    <span>Kamera offline</span>
                  </div>
                ) : (
                  <Closeup
                    boxes={
                      c.n > 10
                        ? undefined
                        : [
                            [90, 110, "ok", 90],
                            [210, 100, "raw", 85],
                          ]
                    }
                  />
                )}
                {c.st === "online" && <span className="live">● LIVE</span>}
              </div>
              <div className="cm">
                <div>
                  <b>Kamera Blok {c.id}</b>
                  <small className="mut">
                    Blok {c.b} · {c.t}
                  </small>
                </div>
                <Badge
                  c={
                    c.st === "online"
                      ? "ok"
                      : c.st === "warning"
                        ? "raw"
                        : "off"
                  }
                >
                  {c.st === "online"
                    ? "Online"
                    : c.st === "warning"
                      ? "Koneksi lemah"
                      : "Offline"}
                </Badge>
              </div>
              <div className="cm">
                <small className="mut">
                  {c.st === "offline"
                    ? "Tidak ada data terbaru"
                    : c.n + " buah terdeteksi"}
                </small>
                <button className="btn ghost" onClick={() => setB(c.b)}>
                  Lihat Detail
                </button>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <div className="hd">
            <div>
              <h3>Lingkungan Blok {b}</h3>
              <p className="sub">Sensor, terpisah dari deteksi kamera</p>
            </div>
            <Sel
              v={b}
              on={setB}
              label="Blok"
              opts={Object.keys(BLOK).map((k) => [k, "Blok " + k])}
            />
          </div>
          <Sensors list={sensors(b)} />
          <Demo />
        </Card>
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
              Kebun Sumber Rejeki ·{" "}
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
export function Kamera({ toast }) {
  return (
    <>
      <Head t="Kelola Kamera" s="Atur kamera pemantau di setiap blok.">
        <button
          className="btn"
          onClick={() =>
            toast("Alur Tambah Kamera belum dibuat di prototipe ini.")
          }
        >
          Tambah Kamera
        </button>
      </Head>
      <Card>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Kamera</th>
                <th>Blok</th>
                <th>Status</th>
                <th>Terakhir terhubung</th>
              </tr>
            </thead>
            <tbody>
              {CAMS.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>Kamera {c.id}</b>
                  </td>
                  <td>Blok {c.b}</td>
                  <td>
                    <Badge
                      c={
                        c.st === "online"
                          ? "ok"
                          : c.st === "warning"
                            ? "raw"
                            : "off"
                      }
                    >
                      {c.st === "online"
                        ? "Online"
                        : c.st === "warning"
                          ? "Koneksi lemah"
                          : "Offline"}
                    </Badge>
                  </td>
                  <td>{c.t}</td>
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
          ["Kebun Default", "Kebun Sumber Rejeki"],
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
