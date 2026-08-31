"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { CATALOG_LABEL, CATALOG_PDF_HREF } from "@/lib/catalog";

/**
 * Submenú de «Productos» (requerimientos 12 y 13, 2026-08-28). «Ver productos»
 * lleva al catálogo y «Descargar catálogo» abre el PDF. Una sola fuente para
 * escritorio y móvil, para que los dos menús no diverjan.
 *
 * Mientras el PDF no exista (`CATALOG_PDF_HREF === null`), la entrada se pinta
 * igual pero inerte y rotulada «Próximamente»: un desplegable con una sola
 * opción no se lee como menú, y un enlace que promete un archivo y no lo
 * entrega es peor que decir la verdad. Al poner la ruta en src/lib/catalog.ts
 * se convierte en enlace real sin tocar nada más.
 */
function productMenuItems() {
  return [
    { href: "/productos", label: "Ver productos", external: false },
    { href: CATALOG_PDF_HREF, label: CATALOG_LABEL, external: true },
  ];
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(false);
  const productItems = productMenuItems();

  // El desplegable se cierra al navegar: con transiciones de vista el nodo
  // sobrevive al cambio de ruta y se quedaría abierto sobre la página nueva.
  useEffect(() => {
    setProductsOpen(false);
  }, [pathname]);

  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const linkClass = `rounded-md px-3 py-2 text-sm font-medium transition ${
          active
            ? "text-petrol underline decoration-orange decoration-2 underline-offset-8"
            : "text-foreground hover:text-petrol"
        }`;

        if (item.href !== "/productos") {
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass}
              >
                {item.label}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
            // El foco que sale del grupo cierra el panel; `relatedTarget`
            // nulo (foco perdido hacia fuera de la ventana) también cuenta.
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setProductsOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setProductsOpen(false);
            }}
          >
            <span className="flex items-center">
              {/* «Productos» sigue siendo un enlace: el desplegable añade
                  caminos, no los reemplaza. */}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${linkClass} pr-1.5`}
              >
                {item.label}
              </Link>
              <button
                type="button"
                aria-expanded={productsOpen}
                aria-controls="menu-productos"
                onClick={() => setProductsOpen((v) => !v)}
                className="flex min-h-8 items-center rounded-md px-1 py-2 text-foreground transition hover:text-petrol"
              >
                <span className="sr-only">
                  {productsOpen ? "Cerrar" : "Abrir"} el menú de productos
                </span>
                <Chevron
                  className={`transition-transform duration-[var(--dur-fast)] ${
                    productsOpen ? "rotate-180" : ""
                  } motion-reduce:transition-none`}
                />
              </button>
            </span>
            {productsOpen ? (
              // Excepción documentada a Flat-At-Rest, igual que el drawer
              // móvil: es una capa flotante y debe separarse del contenido.
              <ul
                id="menu-productos"
                className="nav-dropdown absolute left-0 top-full z-50 mt-1 min-w-64 rounded-md border border-border bg-surface p-1.5 shadow-md"
              >
                {productItems.map((sub) => (
                  <li key={sub.label}>
                    {sub.href ? (
                      <Link
                        href={sub.href}
                        {...(sub.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onClick={() => setProductsOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted hover:text-petrol"
                      >
                        {sub.label}
                      </Link>
                    ) : (
                      <span className="flex items-baseline justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground">
                        <span className="whitespace-nowrap">{sub.label}</span>
                        <span className="whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-wide text-orange">
                          Próximamente
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const productItems = productMenuItems();

  // Cerrar con Escape devolviendo el foco al botón (accesibilidad teclado).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Cerrar al navegar a otra ruta (respaldo del onClick de cada enlace).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border"
      >
        <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {open ? (
        <nav
          id="menu-movil"
          aria-label="Menú principal"
          className="nav-drawer absolute inset-x-0 top-full z-50 border-b border-border bg-surface shadow-md"
        >
          <ul className="p-2">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-4 py-3 text-sm font-medium ${
                      active ? "bg-petrol/10 text-petrol" : "hover:bg-surface-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {/* En móvil no hay hover: los destinos del desplegable se
                      listan siempre, sangrados bajo «Productos». */}
                  {item.href === "/productos" ? (
                    <ul className="mb-1 ml-4 border-l border-border pl-2">
                      {productItems.map((sub) => (
                        <li key={sub.label}>
                          {sub.href ? (
                            <Link
                              href={sub.href}
                              {...(sub.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              onClick={() => setOpen(false)}
                              className="block rounded-md px-4 py-2.5 text-sm text-muted-foreground hover:bg-surface-muted hover:text-petrol"
                            >
                              {sub.label}
                            </Link>
                          ) : (
                            <span className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm text-muted-foreground">
                              {sub.label}
                              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange">
                                Próximamente
                              </span>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
