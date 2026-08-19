"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { mediaUrl } from "@/lib/media";
import type { MediaAsset } from "@/lib/supabase/types";

/**
 * Galería interactiva de la ficha de producto. Único client component de la
 * ruta de producto: la página sigue siendo Server Component y le pasa la
 * galería ya resuelta (MediaAsset es una fila plana serializable).
 *
 * Las miniaturas son botones (no enlaces): cambian la imagen del escenario
 * sin navegar ni abrir el archivo crudo. El escenario abre un visor <dialog>
 * nativo (showModal aporta focus trap, Escape y retorno de foco sin JS
 * adicional). Todas las imágenes se apilan en la misma celda de grid para
 * que el cambio sea instantáneo y sin saltos de layout.
 */
export function ProductGallery({
  gallery,
  productName,
}: {
  gallery: MediaAsset[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = gallery.length;
  const current = gallery[active] ?? gallery[0];

  const goPrev = () => setActive((index) => (index - 1 + count) % count);
  const goNext = () => setActive((index) => (index + 1) % count);

  // Flechas y Home/End sobre las miniaturas: la selección sigue al foco.
  function onThumbKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next !== null) {
      event.preventDefault();
      setActive(next);
      thumbRefs.current[next]?.focus();
    }
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  }

  return (
    <div>
      {/* Escenario: lienzo blanco, empaque completo sin recortes. */}
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-label={`Ampliar imagen de ${productName}`}
        className="grid aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border border-border bg-white p-6 transition ease-out hover:border-petrol/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
      >
        {gallery.map((asset, index) => (
          <Image
            key={asset.id}
            src={mediaUrl(asset)}
            alt={asset.alt_text}
            width={asset.width ?? 1200}
            height={asset.height ?? 1200}
            priority={index === 0}
            aria-hidden={index !== active}
            className={`col-start-1 row-start-1 h-full w-full object-contain object-center transition-opacity duration-[var(--dur-fast)] ease-out motion-reduce:transition-none ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </button>
      <p aria-live="polite" className="sr-only">
        {`Imagen ${active + 1} de ${count}: ${current.alt_text}`}
      </p>

      {count > 1 ? (
        <ul aria-label={`Imágenes de ${productName}`} className="mt-4 grid grid-cols-4 gap-3">
          {gallery.map((asset, index) => (
            <li key={asset.id}>
              <button
                type="button"
                ref={(el) => {
                  thumbRefs.current[index] = el;
                }}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onThumbKeyDown(event, index)}
                aria-pressed={index === active}
                aria-label={`Ver imagen ${index + 1} de ${count}: ${asset.alt_text}`}
                className={`block min-h-11 w-full overflow-hidden rounded-md border bg-white p-1.5 transition ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol ${
                  index === active
                    ? "border-petrol ring-1 ring-inset ring-petrol"
                    : "border-border hover:border-petrol/40"
                }`}
              >
                <Image
                  src={mediaUrl(asset)}
                  alt=""
                  width={160}
                  height={160}
                  className="aspect-square w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Visor: dialog nativo, mismo estado `active` que el escenario. */}
      <dialog
        ref={dialogRef}
        aria-label={`Visor de imágenes de ${productName}`}
        className="product-lightbox"
        onKeyDown={onDialogKeyDown}
        onClick={(event) => {
          // Clic en el backdrop (el propio dialog): cerrar.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Cerrar visor"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition ease-out hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <figure className="flex flex-col items-center gap-3 p-4 sm:px-16">
          <Image
            src={mediaUrl(current)}
            alt={current.alt_text}
            width={current.width ?? 1200}
            height={current.height ?? 1200}
            className="max-h-[76svh] w-auto max-w-full rounded-lg bg-white object-contain p-4"
          />
          <figcaption className="text-center text-sm text-white/90">
            {current.alt_text}{" "}
            {count > 1 ? <span className="text-white/60">({active + 1} de {count})</span> : null}
          </figcaption>
        </figure>

        {count > 1 ? (
          <div className="mt-1 flex items-center justify-center gap-4 pb-4 sm:static sm:pb-0">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Imagen anterior"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition ease-out hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition ease-out hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 3l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
