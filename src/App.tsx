import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFSigningPage = () => {
  const [pdfFile, setPDFFile] = useState<File | null>(null);
  const [signedPdfBlob, setSignedPdfBlob] = useState<Blob | null>(null);
  const [signatureX, setSignatureX] = useState<number>(50);
  const [signatureY, setSignatureY] = useState<number>(50);
  const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number | undefined>(undefined);
  const [pdfHeight, setPdfHeight] = useState<number | undefined>(300);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedPdfFile = e.target.files[0];
      setPDFFile(uploadedPdfFile);

      const pdfUrl = URL.createObjectURL(uploadedPdfFile);
      setPdfUrl(pdfUrl);
      const pdfBytes = await uploadedPdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
  
      setPdfWidth(pageWidth);
      setPdfHeight(pageHeight);
    }
  };

  const handleSignPDF = async () => {
    if (pdfFile && signatureCanvasRef.current) {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      const signatureImage = signatureCanvasRef.current.toDataURL();

      const image = await pdfDoc.embedPng(signatureImage);
      const dims = image.scale(0.5);

      page.drawImage(image, {
        x: signatureX - (dims.width/2),
        y: signatureY - (dims.height/2),
        width: dims.width,
        height: dims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const signedBlob = new Blob([modifiedPdfBytes], {
        type: "application/pdf",
      });

      console.log("setou o blob")
      console.log(signedBlob)
      setSignedPdfBlob(signedBlob);
      console.log(signedPdfBlob)
    }
  };
  const handlePdfClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (signatureCanvasRef.current && pdfHeight !== undefined) {
      const signatureX = event.nativeEvent.offsetX;
      const signatureY = pdfHeight - event.nativeEvent.offsetY;
      setSignatureX(signatureX);
      setSignatureY(signatureY);
    }
  };

  useEffect(() => {
    if (signedPdfBlob) {
      console.log('caiu dentro')
      const url = URL.createObjectURL(signedPdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DocumentoAssinado.pdf";
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [signedPdfBlob]);

  const teste = () => {
    handleSignPDF()
    downloadSignedPDF()
  };


  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Container maxW="container.xl" width="90%">
        <Center mt="8">
          <Box p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
            <VStack spacing="4">
              <Heading mb="4">Assinatura de PDF</Heading>
              <Input type="file" onChange={handlePDFUpload} />
              {pdfUrl && (
                <VStack spacing="4">
                  <Box maxH={pdfHeight} overflow="hidden">
                  <Document
                    file={pdfUrl}
                    onClick={(event) => handlePdfClick(event)}
                  >
                    <Page pageNumber={1} width={pdfWidth} height={pdfHeight} />
                  </Document>
                  </Box>

                  <NumberInput
                    value={signatureX}
                    onChange={(value) => setSignatureX(parseInt(value))}
                  >
                    <NumberInputField placeholder="Posição X" />
                  </NumberInput>
                  <NumberInput
                    value={signatureY}
                    onChange={(value) => setSignatureY(parseInt(value))}
                  >
                    <NumberInputField placeholder="Posição Y" />
                  </NumberInput>
                  <Box borderWidth="1px" borderRadius="lg">
                    <SignatureCanvas
                      ref={signatureCanvasRef}
                      canvasProps={{
                        width: 600,
                        height: 300,
                        className: "signature-canvas",
                      }}
                    />
                  </Box>
                  <Button colorScheme="teal" onClick={handleSignPDF}>
                    Assinar e Baixar
                  </Button>
                </VStack>
              )}
            </VStack>
          </Box>
        </Center>
      </Container>
    </Box>
  );
};

export default PDFSigningPage;
