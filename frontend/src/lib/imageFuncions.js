
  function generateUniqueImageName() {
    const timestamp = Date.now(); // Pega o timestamp atual em milissegundos
    const randomString = Math.random().toString(36).substring(2, 8); // Gera uma string aleatória
    return `post_${timestamp}_${randomString}.jpg`; // Combina para gerar o nome da imagem
  }

  export async function uploadImage(file) {
    try {
      const formData = new FormData();
      const uniqueName = generateUniqueImageName();

      formData.append("image", file, uniqueName);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?expiration=0&key=cf3b368ccf7b142407d2f04d65394d36`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result?.data?.url) {
        return result.data.url; // ✅ retorna a URL da imagem hospedada
      }

      console.error(result);
      window.alert("Erro ao fazer upload da imagem.");
      return null;

    } catch (err) {
      console.error(err);
      window.alert("Erro no upload da imagem.");
      return null;
    }
  }