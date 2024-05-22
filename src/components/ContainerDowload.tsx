import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { base64ToPdf } from "@/lib/uteis";
import { Document, Page } from "react-pdf";
import { PdfData } from "@/pages";

export default function ContainerDownload({
  setButtonProgressSetp,
  arquivoAssinado,
}: any) {
  const [pdfsAssinados, setPdfsAssinados] = useState<PdfData[]>([]);
  const [pageNumberState, setPageNumberState] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    setButtonProgressSetp(true);
    const loadPDFs = async () => {
      const pdfDataArray = base64ToPdf(arquivoAssinado);
      setPdfsAssinados(await pdfDataArray);
    };

    loadPDFs();
  }, [arquivoAssinado]);

  const handlePageChange = (pdfData: PdfData, newPageNumber: number) => {
    setPageNumberState((prevState) => ({
      ...prevState,
      [pdfData.url]: newPageNumber,
    }));
  };

  return (
    <Box>
      <Heading textAlign={"center"} marginBottom={5}>
        Documentos Assinados
      </Heading>
      {pdfsAssinados.map((pdfData, index) => {
        const pageNumber = pageNumberState[pdfData.url] || 1;
        const totalPages = pdfData.numPages;

        return (
          <Box
            key={index}
            width="100%"
            alignItems={"center"}
            marginBottom={3}
            height="auto"
            borderWidth="1px"
          >
            <Box
              overflow="auto"
              width="100%"
              marginBottom={3}
              height="auto"
              borderWidth="1px"
              background={"gray"}
            >
              <Document file={pdfData.url}>
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div
                    key={pageIndex}
                    style={{
                      display: pageIndex + 1 === pageNumber ? "block" : "none",
                    }}
                  >
                    <Page
                      pageNumber={pageIndex + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
            </Box>
            <Box minW={"100%"}>
              <Flex gap={3} minW={"100%"} justifyContent={"center"}>
                <Button
                  colorScheme="teal"
                  onClick={() =>
                    handlePageChange(pdfData, Math.max(1, pageNumber - 1))
                  }
                  isDisabled={pageNumber <= 1}
                >
                  Anterior
                </Button>
                <Flex align={"center"}>
                  Página {pageNumber} de {totalPages}
                </Flex>
                <Button
                  colorScheme="teal"
                  onClick={() =>
                    handlePageChange(
                      pdfData,
                      Math.min(totalPages, pageNumber + 1)
                    )
                  }
                  isDisabled={pageNumber >= totalPages}
                >
                  Próximo
                </Button>
              </Flex>
            </Box>
            <Flex minW={"100%"} justifyContent={"center"}>
              <a
                href={pdfData.url}
                download={`documento${index}.pdf`}
                target="_blank"
              >
                <Button colorScheme="teal" m={3}>
                  Fazer download do Documento Assinado
                </Button>
              </a>
            </Flex>
          </Box>
        );
      })}
    </Box>
  );
}
