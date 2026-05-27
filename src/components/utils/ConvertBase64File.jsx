export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se recibio ningun archivo'));
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      // reader.result devuelve algo como:
      // data:image/jpeg;base64,/9j/4AAQSk...

      const resultado = String(reader.result || '');

      // Separar metadata y base64
      const [metadata, base64] = resultado.split(',');

      if (!metadata || !base64) {
        reject(new Error('No fue posible leer el contenido del archivo'));
        return;
      }

      // Obtener mime type
      const mimeTypeMatch = metadata.match(/data:(.*);base64/);
      if (!mimeTypeMatch) {
        reject(new Error('No se pudo identificar el tipo MIME del archivo'));
        return;
      }

      const mimeType = mimeTypeMatch[1];

      resolve({
        base64,
        mimeType,
      });
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
  });
};