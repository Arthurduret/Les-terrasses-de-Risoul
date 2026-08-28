import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nécessaire pour l'image Docker (voir Dockerfile) : produit un build
  // autonome (.next/standalone) qui n'a besoin ni de node_modules complet
  // ni du reste du projet pour tourner — image bien plus légère.
  output: "standalone",
};

export default nextConfig;
