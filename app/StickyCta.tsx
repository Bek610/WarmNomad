"use client";

import { useEffect, useState } from "react";

// Захиалгын хэсэг дэлгэцэн дээр харагдаж байх үед доод товчийг нууна
export default function StickyCta({ label }: { label: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("order");
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a href="#order" className={`sticky-cta ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden}>
      {label}
    </a>
  );
}
