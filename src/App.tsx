import React, { useRef, useState } from "react";
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

const PDFSigningPage = () => {
  const [pdfFile, setPDFFile] = useState<File | null>(null);
  const [signedPdfBlob, setSignedPdfBlob] = useState<Blob | null>(null);
  const [signatureX, setSignatureX] = useState<number>(100);
  const [signatureY, setSignatureY] = useState<number>(100);
  const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedPdfFile = e.target.files[0];
      setPDFFile(uploadedPdfFile);

      const pdfUrl = URL.createObjectURL(uploadedPdfFile);
      setPdfUrl(pdfUrl);
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

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      page.drawImage(image, {
        x: pageWidth - dims.width - 50,
        y: 50,
        width: dims.width,
        height: dims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const signedBlob = new Blob([modifiedPdfBytes], {
        type: "application/pdf",
      });

      setSignedPdfBlob(signedBlob);
    }
  };

  const downloadSignedPDF = () => {
    if (signedPdfBlob) {
      const url = URL.createObjectURL(signedPdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "DocumentoAssinado.pdf";
      link.click();
      URL.revokeObjectURL(url);
    }
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
                  <embed
                    src={pdfUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  />
                  {/* <NumberInput
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
                  </NumberInput> */}
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
                    Assinar PDF
                  </Button>
                  <Button colorScheme="teal" onClick={downloadSignedPDF}>
                    Baixar PDF Assinado
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
