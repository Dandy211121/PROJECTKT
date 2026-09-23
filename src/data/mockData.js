export const kpiData = {
  totalDetected: 14520,
  ripePods: 8200,
  unripePods: 5100,
  overripeDiseased: 1220,
  estimatedYieldKg: 1045,
};

export const maturityTrendData = [
  { name: "Minggu 1", ripe: 6000, unripe: 7500, overripe: 800 },
  { name: "Minggu 2", ripe: 6500, unripe: 6800, overripe: 950 },
  { name: "Minggu 3", ripe: 7200, unripe: 6000, overripe: 1050 },
  { name: "Minggu 4", ripe: 8200, unripe: 5100, overripe: 1220 },
];

export const blockDistributionData = [
  { name: "Blok A", ripe: 3500, unripe: 2000, overripe: 400 },
  { name: "Blok B", ripe: 2800, unripe: 1500, overripe: 520 },
  { name: "Blok C", ripe: 1900, unripe: 1600, overripe: 300 },
];

export const recentDetections = [
  {
    id: 1,
    timestamp: "2023-10-24 08:12:45",
    block: "Blok A",
    camera: "Cam A-01",
    status: "Matang",
    confidence: 96,
    color: "yellow",
  },
  {
    id: 2,
    timestamp: "2023-10-24 08:11:30",
    block: "Blok B",
    camera: "Cam B-03",
    status: "Mentah",
    confidence: 92,
    color: "green",
  },
  {
    id: 3,
    timestamp: "2023-10-24 08:09:15",
    block: "Blok A",
    camera: "Cam A-02",
    status: "Terlalu Matang/Busuk",
    confidence: 88,
    color: "red",
  },
  {
    id: 4,
    timestamp: "2023-10-24 08:05:50",
    block: "Blok C",
    camera: "Cam C-01",
    status: "Matang",
    confidence: 98,
    color: "yellow",
  },
  {
    id: 5,
    timestamp: "2023-10-24 08:02:10",
    block: "Blok B",
    camera: "Cam B-02",
    status: "Mentah",
    confidence: 90,
    color: "green",
  },
];
