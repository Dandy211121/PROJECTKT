import { useEffect, useState } from "react";

export function StatsCard({ title, value, icon: Icon, subtitle, trend, colorVariant = "sky" }) {
  const tones = {
    ocean: { color: "#006199", text: "#006199" },
    sky: { color: "#8ACFF8", text: "#064365" },
    gold: { color: "#FFD444", text: "#594200" },
    lemon: { color: "#F4EB6C", text: "#4b4700" },
  };
  const tone = tones[colorVariant] ?? tones.sky;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 900;
    let frame;
    let start;
    const animate = (time) => {
      if (start === undefined) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <article
      className="glass-card hover-card stats-card"
      style={{ "--tone": tone.color, "--tone-text": tone.text }}
    >
      <div className="stats-top">
        <p className="stats-label">{title}</p>
        <div className="stats-icon">
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </div>
      </div>
      <div className="stats-value-row">
        <h2 className="stats-value">{count.toLocaleString("en-US")}</h2>
        {trend && <span className="trend-chip">{trend}</span>}
      </div>
      {subtitle && <p className="stats-caption">{subtitle}</p>}
    </article>
  );
}
