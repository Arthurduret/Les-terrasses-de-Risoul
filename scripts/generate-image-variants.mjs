// Génère les variantes WebP des photos de l'appartement, en trois largeurs.
//
// Lancé automatiquement avant chaque build (script `prebuild`). Il ne
// retouche que ce qui manque ou ce qui est plus ancien que le JPEG source,
// donc un build sans nouvelle photo ne coûte rien.
//
// La convention du projet est ainsi préservée : déposer un fichier .jpeg
// dans public/images/apartment/ suffit toujours, les variantes suivent
// toutes seules au build suivant.

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DOSSIER = "public/images/apartment";
// 640 pour les téléphones, 1024 pour les tablettes et petits portables,
// la pleine résolution pour le reste. Un mobile de 375 px téléchargeait
// jusqu'ici une image de 1600 px de large.
const LARGEURS = [640, 1024];
const QUALITE = 80;

async function plusRecentQue(cible, source) {
  if (!existsSync(cible)) return false;
  const [c, s] = await Promise.all([stat(cible), stat(source)]);
  return c.mtimeMs >= s.mtimeMs;
}

async function main() {
  const fichiers = (await readdir(DOSSIER)).filter((f) => /\.jpe?g$/i.test(f));
  let generes = 0;

  for (const fichier of fichiers) {
    const source = path.join(DOSSIER, fichier);
    const base = fichier.replace(/\.jpe?g$/i, "");
    const { width } = await sharp(source).metadata();

    const sorties = [
      { chemin: path.join(DOSSIER, `${base}.webp`), largeur: null },
      ...LARGEURS.map((l) => ({
        chemin: path.join(DOSSIER, `${base}-w${l}.webp`),
        // Jamais d'agrandissement : une photo portrait de 900 px de large
        // produit un fichier de 900 px pour la variante « 1024 ».
        largeur: Math.min(l, width ?? l),
      })),
    ];

    for (const { chemin, largeur } of sorties) {
      if (await plusRecentQue(chemin, source)) continue;
      const pipeline = sharp(source);
      if (largeur) pipeline.resize({ width: largeur });
      await pipeline.webp({ quality: QUALITE }).toFile(chemin);
      generes += 1;
    }
  }

  console.log(
    generes === 0
      ? `  variantes d'images : à jour (${fichiers.length} photos)`
      : `  variantes d'images : ${generes} fichier(s) généré(s)`
  );
}

main().catch((err) => {
  console.error("Génération des variantes d'images impossible :", err);
  process.exit(1);
});
