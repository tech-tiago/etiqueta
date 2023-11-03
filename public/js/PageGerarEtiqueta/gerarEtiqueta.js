document.addEventListener("DOMContentLoaded", async function () {
  const gerarPdfButton = document.getElementById("gerarPdfButton");
  const pdfEmbed = document.getElementById("pdfEmbed");
  
  gerarPdfButton.addEventListener("click", async () => {
      // Substitua '12' pelo ID do item desejado
      const itemId = 1;
      
      try {
          const response = await fetch(`/gerar-etiqueta/${itemId}`);
          if (!response.ok) {
              throw new Error("Erro ao gerar etiqueta PDF.");
          }
          
          const pdfBlob = await response.blob();
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Exiba o PDF no iframe
          pdfEmbed.src = pdfUrl;
      } catch (error) {
          console.error(error.message);
      }
  });
});