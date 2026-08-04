"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/empresa", label: "Contenido de la empresa" },
  { href: "/admin/contacto", label: "Información de contacto" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/preguntas-frecuentes", label: "Preguntas frecuentes" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones del panel" className="p-2">
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-surface-muted"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
