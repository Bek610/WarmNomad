"use client";

import { useState } from "react";

export default function Gallery({ images, video, alt }: { images: string[]; video?: string; alt: string }) {
  const items = [...(video ? [{ type: "video" as const, src: video }] : []), ...images.map((src) => ({ type: "img" as const, src }))];
  const [active, setActive] = useState(0);

  if (items.length === 0) {
    return (
      <div className="media-ph" role="img" aria-label="Бүтээгдэхүүний зураг">
        <span>Бүтээгдэхүүний зураг / видео</span>
      </div>
    );
  }

  const current = items[Math.min(active, items.length - 1)];

  return (
    <div className="gallery">
      {current.type === "video" ? (
        <video key={current.src} className="media" src={current.src} autoPlay muted loop playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={current.src} className="media" src={current.src} alt={alt} />
      )}
      {items.length > 1 && (
        <div className="thumbs" role="tablist" aria-label="Зургууд">
          {items.map((it, i) => (
            <button
              key={it.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Зураг ${i + 1}`}
              className={`thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {it.type === "video" ? (
                <span className="thumb-video">▶</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.src} alt="" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}