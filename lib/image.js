// Comprime imagens no navegador antes de embutir na proposta.
// As imagens viajam como data-URL no JSON e a Vercel limita o corpo da
// requisição a 4,5MB, então cada imagem precisa sair pequena daqui.

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.8;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem'));
    };
    img.src = url;
  });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensiona e recomprime uma imagem, retornando um data-URL.
 * Usa WebP (preserva transparência) e mantém o original caso a
 * versão comprimida fique maior.
 */
export async function compressImage(file, { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {}) {
  const original = await readAsDataURL(file);

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL('image/webp', quality);
    // toDataURL cai para PNG quando o formato não é suportado; nesse caso
    // (ou se a compressão não ajudou) fica com o menor dos dois.
    if (compressed.startsWith('data:image/webp') && compressed.length < original.length) {
      return compressed;
    }
    return original;
  } catch {
    return original;
  }
}

/** Tamanho aproximado, em MB, que um objeto ocupa serializado em JSON. */
export function jsonSizeMB(obj) {
  return new Blob([JSON.stringify(obj)]).size / (1024 * 1024);
}
