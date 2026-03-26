const triggerAnchorDownload = (href, filename) => {
  const link = document.createElement("a");

  link.href = href;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo preparar el archivo para descarga."));
    reader.readAsDataURL(blob);
  });

export const downloadBlobFile = async (
  data,
  filename,
  mimeType = "application/octet-stream"
) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });

  if (typeof window.navigator.msSaveOrOpenBlob === "function") {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  try {
    const objectUrl = window.URL.createObjectURL(blob);
    triggerAnchorDownload(objectUrl, filename);
    window.URL.revokeObjectURL(objectUrl);
    return;
  } catch (error) {
    const dataUrl = await blobToDataUrl(blob);
    triggerAnchorDownload(dataUrl, filename);
  }
};

export default downloadBlobFile;
