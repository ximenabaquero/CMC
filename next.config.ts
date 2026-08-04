import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // En Cloudflare Workers no está disponible el optimizador de imágenes de
    // Next (sharp). Las imágenes se pre-dimensionan al importarlas y las
    // cargas del CMS tienen límite de tamaño. No se activa ninguna función
    // paga (Cloudflare Images) sin autorización del cliente.
    unoptimized: true,
  },
};

export default nextConfig;

// Permite acceder a los bindings de Cloudflare (R2, D1) durante `next dev`.
initOpenNextCloudflareForDev();
