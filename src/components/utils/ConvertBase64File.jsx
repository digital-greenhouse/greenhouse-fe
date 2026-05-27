export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No se recibió ningún archivo");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      // reader.result devuelve algo como:
      // data:image/jpeg;base64,/9j/4AAQSk...

      const resultado = reader.result;

      // Separar metadata y base64
      const [metadata, base64] = resultado.split(",");

      // Obtener mime type
      const mimeType = metadata.match(/data:(.*);base64/)[1];

      resolve({
        base64,
        mimeType,
      });
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};