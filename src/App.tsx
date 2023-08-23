import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Input,
  VStack,
} from '@chakra-ui/react';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';

const PDFSigningPage = () => {
  const [pdfFile, setPDFFile] = useState<File | null>(null);
  const [signedPdfBlob, setSignedPdfBlob] = useState<Blob | null>(null);
  const signatureCanvasRef = useRef<SignatureCanvas | null>(null);

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPDFFile(e.target.files[0]);
    }
  };

  const handleSignPDF = async () => {
    if (pdfFile && signatureCanvasRef.current) {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      const signatureImage = signatureCanvasRef.current.toDataURL();

      const image = await pdfDoc.embedPng(signatureImage);
      const dims = image.scale(0.25);

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      page.drawImage(image, {
        x: pageWidth - dims.width - 50,
        y: 50,
        width: dims.width,
        height: dims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const signedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      setSignedPdfBlob(signedBlob);
    }
  };

  const downloadSignedPDF = () => {
    if (signedPdfBlob) {
      const url = URL.createObjectURL(signedPdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'signed.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container maxW="xl">
      <Center mt="8">
        <Box p="6" borderWidth="1px" borderRadius="lg" boxShadow="lg">
          <VStack spacing="4">
            <Heading mb="4">Assinatura de PDF</Heading>
            <Input type="file" onChange={handlePDFUpload} />
            <SignatureCanvas
              ref={signatureCanvasRef}
              canvasProps={{ width: 300, height: 150, className: 'signature-canvas' }}
            />
            <Button colorScheme="teal" onClick={handleSignPDF}>
              Assinar PDF
            </Button>
            <Button colorScheme="teal" onClick={downloadSignedPDF}>
              Baixar PDF Assinado
            </Button>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
};

export default PDFSigningPage;
