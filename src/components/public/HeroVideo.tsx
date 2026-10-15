"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fondo del banner principal.
 *
 * Para que la página cargue rápido:
 * 1. Primero se muestra una imagen fija (el primer cuadro del video, 16 KB).
 * 2. El video se pide recién cuando la página terminó de cargar, y en una
 *    versión chica en celulares (WebM ~300 KB / MP4 ~490 KB) o mediana en
 *    compu (WebM ~460 KB / MP4 ~850 KB).
 * 3. No se carga si la persona activó "reducir movimiento" o el ahorro de datos.
 * 4. Se pausa cuando el banner sale de la pantalla.
 */
const VIDEOS = {
  chico: { webm: "/video/hero-960.webm", mp4: "/video/hero-960.mp4" },
  mediano: { webm: "/video/hero-1280.webm", mp4: "/video/hero-1280.mp4" },
};

type Conexion = { saveData?: boolean; effectiveType?: string };

export function HeroVideo() {
  const [fuente, setFuente] = useState<(typeof VIDEOS)["chico"] | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Elegir y empezar a cargar el video recién cuando la página terminó de cargar
  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conexion = (navigator as Navigator & { connection?: Conexion }).connection;
    const ahorro = conexion?.saveData || /(^|-)2g$/.test(conexion?.effectiveType ?? "");
    if (reducir || ahorro) return;

    const elegir = () =>
      setFuente(window.matchMedia("(max-width: 768px)").matches ? VIDEOS.chico : VIDEOS.mediano);

    if (document.readyState === "complete") {
      const id = window.setTimeout(elegir, 150);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", elegir, { once: true });
    return () => window.removeEventListener("load", elegir);
  }, []);

  // Pausar cuando el banner no se ve (ahorra batería y CPU)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [fuente]);

  return (
    <>
      <Image
        src="/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {fuente && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            reproduciendo ? "opacity-100" : "opacity-0",
          )}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReproduciendo(true)}
        >
          <source src={fuente.webm} type="video/webm" />
          <source src={fuente.mp4} type="video/mp4" />
        </video>
      )}
    </>
  );
}
