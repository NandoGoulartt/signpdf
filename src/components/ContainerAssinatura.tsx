import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureCanvas from "react-signature-canvas";
import { PdfData } from "@/pages";
import { base64ToPdf } from "@/lib/uteis";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type ContainerAssinaturaProps = {
  setButtonProgressSetp: any;
  arquivoAssinar: any;
  signatureCanvasRef: any;
  arquivoAssinado: any;
  pdfAssinar: PdfData[];
  setPdfAssinar: (pdfData: PdfData[]) => void;
};

export default function ContainerAssinatura({
  setButtonProgressSetp,
  arquivoAssinar,
  signatureCanvasRef,
  pdfAssinar,
  setPdfAssinar,
  arquivoAssinado,
}: ContainerAssinaturaProps) {
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  useEffect(() => {
    const loadPDFs = async () => {
      const pdfDataArray = base64ToPdf(arquivoAssinar.docs);
      setPdfAssinar(await pdfDataArray);
    };

    loadPDFs();
  }, [arquivoAssinar]);

  useEffect(() => {
    if (arquivoAssinado.length > 0) {
      setButtonProgressSetp(false);
      console.log("teste");
    } else {
      setButtonProgressSetp(true);
    }
  }, [arquivoAssinado]);

  const handleClearSignature = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setPlaceholderVisible(true);
    }
  };

  const handleDrawStart = () => {
    setPlaceholderVisible(false);
  };
  return (
    <Box>
      <Heading textAlign={"center"} marginBottom={5}>
        Assinatura Digital
      </Heading>
      {pdfAssinar.map((pdfData, index) => {
        return (
          <Box
            key={index}
            overflow="auto"
            width="100%"
            marginBottom={3}
            height="auto"
            borderWidth="1px"
            background={"gray"}
          >
            <Document file={pdfData.url}>
              {pdfData &&
                Array.from({ length: pdfData.numPages }).map((_, i) => (
                  <Box margin={2} key={`Box.${pdfData.type}.${i}`}>
                    <Page
                      key={`${pdfData.type}.${i}`}
                      pageIndex={i}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Box>
                ))}
            </Document>
          </Box>
        );
      })}
    <Flex
      marginY={2}
      width={"100%"}
      overflow="auto"
      justifyContent={"center"}
      alignContent={"center"}
      borderWidth="1px"
      borderRadius="lg"
      position="relative"
    >
      <SignatureCanvas
        minWidth={1}
        ref={signatureCanvasRef}
        canvasProps={{
          width: "auto",
          height: "auto",
          className: "signature-canvas",
        }}
        onBegin={handleDrawStart}
      />
      {placeholderVisible && (
        <div
          style={{
            position: "absolute",
            top: "80%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "16px",
            color: "gray",
            pointerEvents: "none",
            borderTop: "1px solid gray",
            width:"70%",
            textAlign: "center",
          }}
        >
          Assine aqui
        </div>
      )}
    </Flex>
      <Button colorScheme="teal" onClick={handleClearSignature}>
        Limpar
      </Button>
    </Box>
  );
}
