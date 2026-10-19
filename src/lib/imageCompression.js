/**
 * Client-Side Image Compression using HTML5 Canvas
 * Resizes large camera photos to max 1280px dimension and converts to JPEG ~0.78 quality.
 * Keeps photos sharp and vivid while dropping file size from 4-8 MB to ~200-400 KB.
 */

export async function compressImage(file, maxDimension = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("File yang dipilih bukan gambar yang valid."));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Gagal mengompresi gambar."));
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now()
            });

            const dataUrl = canvas.toDataURL("image/jpeg", quality);

            resolve({
              file: compressedFile,
              dataUrl,
              originalSizeBytes: file.size,
              compressedSizeBytes: blob.size,
              width,
              height,
              ratio: Math.round(((file.size - blob.size) / file.size) * 100)
            });
          },
          "image/jpeg",
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
