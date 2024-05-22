import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Input,
  AlertIcon,
  Alert,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import CryptoJS from "crypto-js";
import { format } from "date-fns";

interface Docs {
  type: string;
  md5: string;
  base64: string;
  qtd_paginas: number;
}

interface ArquivoConsultado {
  cnpj_empresa: string;
  nome_cliente: string;
  cpf_cliente: string;
  id_externo: string;
  docs: Docs[];
  ind_assinado: boolean;
  assinaturaAt: String;
}

export default function CallToActionWithAnnotation() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [arquivoConsultado, setArquivoConsultado] =
    useState<ArquivoConsultado>();
  const [md5HashCost, setMd5HashCost] = useState("");
  const [dataAtual, setDataAtual] = useState("");
  const [submittingValidation, setSubmittingValidation] =
    useState<boolean>(false);

  const handleFile = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  function formatarCnpj(cnpj: String | undefined) {
    if (!cnpj) return "";
    const numerosCnpj = cnpj.replace(/\D/g, "");

    if (numerosCnpj.length >= 12) {
      const cnpjFormatado = `**.*${numerosCnpj.substring(5, 9)}/0***-**`;

      return cnpjFormatado;
    }
    return cnpj;
  }

  function formatarCpf(cpf: String | undefined) {
    if (!cpf) return "";
    const numerosCpf = cpf.replace(/\D/g, "");

    if (numerosCpf.length >= 9) {
      const cpfFormatado = `***.${numerosCpf.substring(
        3,
        6
      )}.${numerosCpf.substring(6, 8)}-**`;

      return cpfFormatado;
    }
    return cpf;
  }

  const handleConsultar = async () => {
    setErrorMessage(false);
    setSuccessMessage(false);
    if (uploadFile) {
      setSubmittingValidation(true);
      const reader = new FileReader();

      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const dataArray = Array.from(uint8Array);
        const md5Hash = CryptoJS.MD5(
          CryptoJS.lib.WordArray.create(dataArray)
        ).toString();
        setMd5HashCost(md5Hash);
        try {
          const response = await fetch(`/api/arquivos?md5=${md5Hash}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.cnpj_empresa) {
              setArquivoConsultado(data);
              const dataTime = new Date();

              const dataFormatada = format(dataTime, "dd/MM/yyyy HH:mm");
              setDataAtual(dataFormatada);
              setSuccessMessage(true);
              setSubmittingValidation(false);
            } else {
              setErrorMessage(true);
              setSubmittingValidation(false);
            }
          } else {
            console.error("Erro na solicitação HTTP:", response.status);
            setSubmittingValidation(false);
          }
        } catch (error) {
          console.error("Erro na solicitação HTTP:", error);
          setSubmittingValidation(false);
        }
      };
      reader.readAsArrayBuffer(uploadFile);
    }
  };

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
      >
        <Container maxW={"3xl"}>
          <Stack
            as={Box}
            textAlign={"center"}
            spacing={{ base: 8, md: 14 }}
            py={{ base: 20, md: 36 }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
              lineHeight={"110%"}
            >
              Consulte a veracidade do seu
              <br />
              <Text as={"span"} color={"blue.400"}>
                Documento
              </Text>
            </Heading>
            <Text color={"gray.500"}>
              Faça upload do seu documento e veja se ele é veridico.
            </Text>
            <Input type="file" onChange={handleFile} accept=".pdf" />
            <Stack
              direction={"column"}
              spacing={3}
              align={"center"}
              alignSelf={"center"}
              position={"relative"}
            >
              <Button
                colorScheme={"blue"}
                bg={"blue.400"}
                rounded={"full"}
                px={6}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={handleConsultar}
              >
                {submittingValidation ? <Spinner size="sm" /> : "Validar"}
              </Button>
            </Stack>
            <Stack spacing={3}>
              {errorMessage ? (
                <Alert status="error">
                  <AlertIcon />
                  Você submeteu um documento sem assinatura reconhecivel ou com
                  assinatura corrompida
                </Alert>
              ) : null}
              {successMessage ? (
                <Box background={"rgba(154, 230, 180, 0.16)"}>
                  <Alert status="success">
                    <AlertIcon />
                    Documento com assinaturas válidas!
                  </Alert>
                  <Flex
                    direction={"column"}
                    background={"rgba(154, 230, 180, 0.16)"}
                    alignItems={"baseline"}
                    padding={5}
                    gap={2}
                    wrap={"wrap"}
                  >
                    <Text>
                      <Flex gap={2}>
                        <Text>CNPJ do solicitante: </Text>
                        <Text>
                          {formatarCnpj(arquivoConsultado?.cnpj_empresa)}
                        </Text>
                      </Flex>
                    </Text>
                    <Text>
                      <Flex wrap={"wrap"} gap={2}>
                        <Text>Assinado por: </Text>
                        <Text>{arquivoConsultado?.nome_cliente}</Text>
                      </Flex>
                    </Text>
                    <Text>
                      <Flex gap={2}>
                        <Text>CPF: </Text>
                        <Text>
                          {formatarCpf(arquivoConsultado?.cpf_cliente)}
                        </Text>
                      </Flex>
                    </Text>
                    <Text>
                      <Flex wrap={"wrap"} gap={2}>
                        <Text>Hash: </Text>
                        <Text>{md5HashCost}</Text>
                      </Flex>
                    </Text>
                    <Text>
                      <Flex gap={2}>
                        <Text>Data de assinatura: </Text>
                        <Text>{arquivoConsultado?.assinaturaAt}</Text>
                      </Flex>
                    </Text>

                    <Text>
                      <Flex gap={2}>
                        <Text>Data de Consulta: </Text>
                        <Text>{dataAtual}</Text>
                      </Flex>
                    </Text>
                  </Flex>
                </Box>
              ) : null}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
