import { PDFDocument } from "pdf-lib";

export async function base64ToPdf(docs: any){
    const pdfDataArray = [];

      for (const doc of docs) {
        try {
          const binaryString = atob(doc.base64);
          const byteArray = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
          }

          const pdfDoc = await PDFDocument.load(byteArray);

          const pages = pdfDoc.getPages();

          const modifiedPdfData = await pdfDoc.save();

          pdfDataArray.push({
            url: URL.createObjectURL(
              new Blob([modifiedPdfData], { type: "application/pdf" })
            ),
            width: pages[0].getWidth(),
            height: pages[0].getHeight(),
            data: modifiedPdfData,
            type: doc.type,
            numPages: pages.length,
          });
        } catch (error) {
          console.error("Erro ao criar o PDF:", error);
        }
      }
    return pdfDataArray;
  }