import { useEffect, useRef, useState } from "react";
import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Flex,
  AlertIcon,
  Alert,
  Heading,
  Text,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import SignatureCanvas from "react-signature-canvas";

import { useToast } from "@chakra-ui/react";
import ContainerCpfCnpj from "@/components/ContainerCpfCnpj";
import ContainerAssinatura from "@/components/ContainerAssinatura";
import ContainerPicture from "@/components/ContainerPicture";
import { useRouter } from "next/router";
import { PDFDocument } from "pdf-lib";
import CryptoJS from "crypto-js";
import { format } from "date-fns";
import { WarningTwoIcon } from "@chakra-ui/icons";
import ContainerDowload from "@/components/ContainerDowload";

export type PdfData = {
  url: string;
  width: number;
  height: number;
  data: Uint8Array;
  type: string;
  numPages: number;
};

export default function Multistep() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [buttonProgressStep, setButtonProgressSetp] = useState(false);
  const [identificacaoCpf, setIdentificacaoCpf] = useState("");
  const [identificacaoNome, setIdentificacaoNome] = useState("");
  const [identificacaoTermos, setIdentificacaoTermos] = useState(false);
  const [fotografia, setFotografia] = useState("");
  const [arquivoAssinar, setArquivoAssinar] = useState("");
  const signatureCanvasRef = useRef<SignatureCanvas | null>(null);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [signedPdfBlob, setSignedPdfBlob] = useState<Blob[] | null>(null);
  const [arquivoAssinado, setArquivoAssinado] = useState<[] | any>([]);
  const [pdfAssinar, setPdfAssinar] = useState<PdfData[]>([]);
  const [error, setError] = useState<String | boolean>(false);
  const [existe, setExiste] = useState<boolean | null>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [ipAddress, setIPAddress] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setExiste(true);
    async function fetchData() {
      try {
        if (id) {
          const response = await fetch(
            `/api/arquivos?id=${id}&ind_assinado=false`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              },
            }
          );
          fetch("https://api.ipify.org?format=json")
            .then((response) => response.json())
            .then((data) => {
              setIPAddress(data.ip);
            });
          if (response.ok) {
            const data = await response.json();
            if (data.message) {
              setExiste(false);
            }
            setArquivoAssinar(data);
          } else {
            setExiste(false);
            console.error("Erro na solicitação HTTP:", response.status);
          }
        } else {
          setExiste(false);
        }
      } catch (error) {
        console.error("Erro na solicitação HTTP:", error);
      }
    }
    fetchData();
  }, [id]);

  const handleSaveSignature = async () => {
    setError(false);
    setSubmitting(true);
    if (signatureCanvasRef.current) {
      const isCanvasEmpty = signatureCanvasRef.current.isEmpty();

      if (pdfAssinar && !isCanvasEmpty) {
        let docs = [];
        let blobArray = [];
        let documentoAssinados = [];
        for (const doc of pdfAssinar) {
          const signatureDataURL = signatureCanvasRef.current.toDataURL();

          const pdfDoc = await PDFDocument.load(doc.data);
          const pages = pdfDoc.getPages();
          const signatureImage = await fetch(signatureDataURL).then((res) =>
            res.arrayBuffer()
          );

          if (signatureImage.byteLength > 0) {
            const embeddedSignature = await pdfDoc.embedPng(signatureImage);
            const dims = embeddedSignature.scale(0.25);
            if (doc.type == "BLF") {
              for (const page of pages) {
                page.drawImage(embeddedSignature, {
                  x: 250,
                  y: 685,
                  width: dims.width,
                  height: dims.height,
                });
              }
            } else if (doc.type == "NFE") {
              const page = pages[0];
              page.drawImage(embeddedSignature, {
                x: 320,
                y: 762,
                width: dims.width,
                height: dims.height,
              });
            } else if (doc.type == "CT") {
              const position = pages.length - 1;
              console.log(position);
              const page = pages[position];
              page.drawImage(embeddedSignature, {
                x: 390,
                y: 50,
                width: dims.width,
                height: dims.height,
              });
            }

            setIsCanvasEmpty(isCanvasEmpty);

            const modifiedPdfData = await pdfDoc.save();
            let base64String = "";
            const pdfBytes = new Uint8Array(modifiedPdfData);
            base64String += arrayBufferToBase64(pdfBytes);

            const dataArray = Array.from(pdfBytes);
            const md5Hash = CryptoJS.MD5(
              CryptoJS.lib.WordArray.create(dataArray)
            ).toString();

            docs.push({
              type: doc.type,
              base64: base64String,
              md5: md5Hash,
              qtd_paginas: 1,
            });
            documentoAssinados.push(base64String);
            const blob = new Blob([modifiedPdfData], {
              type: "application/pdf",
            });
            blobArray.push(blob);
          }
        }
        const fotografiaBase64 = fotografia.replace(
          /^data:image\/(png|jpeg|jpg);base64,/,
          ""
        );
        if (fotografiaBase64) {
          docs.push({
            type: "Selfie",
            base64: fotografiaBase64,
            md5: "",
            qtd_paginas: 1,
          });
        }
        const dataTime = new Date();
        const dataFormatada = format(dataTime, "dd/MM/yyyy HH:mm");

        const data = {
          cpf_cliente: identificacaoCpf,
          nome_cliente: identificacaoNome,
          ind_assinado: true,
          docs: docs,
          assinaturaAt: dataFormatada,
          ip: ipAddress,
        };

        try {
          const response = await fetch(`/api/arquivos?id=${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            setSignedPdfBlob(blobArray);
            setArquivoAssinado(docs);
            setSubmitting(false);
            setStep(step + 1);
            setProgress(progress + 25);
            toast({
              title: "Documento assinado.",
              description: "Documentos assinados com sucesso.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            console.error("Erro na atualização:", response.status);
            setSubmitting(false);
          }
        } catch (error) {
          console.error("Erro ao fazer a requisição PUT:", error);
          setSubmitting(false);
        }
      } else {
        setError("A assinatura está vazia, não será adicionada ao PDF.");
        setSubmitting(false);
      }
    }
    setSubmitting(false);
  };
  function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  if (existe) {
    return (
      <>
        <Box
          borderWidth="1px"
          rounded="lg"
          shadow="1px 1px 3px rgba(0,0,0,0.3)"
          maxWidth={800}
          p={6}
          m="10px auto"
          as="form"
          overflow="auto"
        >
          <Progress
            hasStripe
            value={progress}
            mb="5%"
            mx="5%"
            isAnimated
          ></Progress>
          {step === 1 ? (
            <ContainerCpfCnpj
              identificacaoCpf={identificacaoCpf}
              setIdentificacaoCpf={setIdentificacaoCpf}
              identificacaoNome={identificacaoNome}
              setIdentificacaoNome={setIdentificacaoNome}
              identificacaoTermos={identificacaoTermos}
              setIdentificacaoTermos={setIdentificacaoTermos}
              setButtonProgressSetp={setButtonProgressSetp}
            />
          ) : step === 2 ? (
            <ContainerPicture
              fotografia={fotografia}
              setFotografia={setFotografia}
              setButtonProgressSetp={setButtonProgressSetp}
            />
          ) : step === 3 ? (
            <ContainerAssinatura
              setButtonProgressSetp={setButtonProgressSetp}
              arquivoAssinar={arquivoAssinar}
              signatureCanvasRef={signatureCanvasRef}
              pdfAssinar={pdfAssinar}
              setPdfAssinar={setPdfAssinar}
              arquivoAssinado={arquivoAssinado}
            />
          ) : (
            <ContainerDowload
              setButtonProgressSetp={setButtonProgressSetp}
              arquivoAssinado={arquivoAssinado}
            />
          )}
          <Box marginTop={5}>
            {error ? (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            ) : null}
          </Box>
          <ButtonGroup mt="5%" w="100%">
            <Flex w="100%" justifyContent="space-between">
              <Flex>
                {step <= 3 ? (
                  <>
                    <Button
                      onClick={() => {
                        setStep(step - 1);
                        setProgress(progress - 25);
                      }}
                      isDisabled={step === 1}
                      colorScheme="teal"
                      variant="solid"
                      w="7rem"
                      mr="5%"
                    >
                      Voltar
                    </Button>
                    <Button
                      w="7rem"
                      isDisabled={buttonProgressStep}
                      onClick={() => {
                        setStep(step + 1);
                        if (step === 4) {
                          setProgress(100);
                        } else {
                          setProgress(progress + 25);
                        }
                      }}
                      colorScheme="teal"
                      variant="outline"
                    >
                      Próximo
                    </Button>
                  </>
                ) : null}
              </Flex>
              {step === 3 ? (
                <Button
                  w="7rem"
                  colorScheme="red"
                  px={8}
                  variant="solid"
                  onClick={handleSaveSignature}
                  isDisabled={arquivoAssinado.length > 0 ? true : false}
                >
                  {submitting ? <Spinner size="sm" /> : "Assinar"}
                </Button>
              ) : null}
            </Flex>
          </ButtonGroup>
        </Box>
      </>
    );
  } else {
    return (
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        py={12}
        bg={"gray.50"}
      >
        <Stack
          boxShadow={"2xl"}
          bg={"white"}
          rounded={"xl"}
          p={10}
          spacing={8}
          align={"center"}
        >
          <Box textAlign="center" py={10} px={6}>
            <WarningTwoIcon boxSize={"50px"} color={"orange.300"} />
            <Heading as="h2" size="xl" mt={6} mb={2}>
              Desculpe, ocorreu um problema.
            </Heading>
            <Text color={"gray.500"}>
              Nenhum arquivo corresponde à sua consulta ou nenhuma ID foi
              fornecida na pesquisa. Verifique se a ID está correta e tente
              novamente. Se você acredita que isso é um erro, entre em contato
              com o suporte técnico para assistência.
            </Text>
          </Box>
        </Stack>
      </Flex>
    );
  }
}
