import { ChangeEvent, useState, useEffect } from "react";
import {
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Heading,
  Flex,
  Box,
  AlertIcon,
  Alert,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Link,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import InputMask from "react-input-mask";

export default function ContainerCpfCnpj({
  setButtonProgressSetp,
  setIdentificacaoCpf,
  setIdentificacaoNome,
  identificacaoNome,
  identificacaoCpf,
  identificacaoTermos,
  setIdentificacaoTermos,
}: any) {
  const [state, setState] = useState<"initial" | "submitting" | "success">(
    "initial"
  );
  const [error, setError] = useState<String | boolean>(false);
  const [stepDadosValida, setStepDadosValida] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!stepDadosValida) {
      setButtonProgressSetp(true);
    }
  });

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    setButtonProgressSetp(true);
    setState("initial");
    setIdentificacaoTermos(e.target.checked)
  }

  const handleConfirmeDados = () => {
    setError(false);
    setState("submitting");

    setTimeout(() => {
      if (identificacaoNome.length < 10) {
        setError("Insira seu nome completo!");
        setState("initial");
        setButtonProgressSetp(true);
        return;
      }
      if (!handleVerificarCpf(identificacaoCpf)) {
        setError("Insira um CPF válido!");
        setState("initial");
        setButtonProgressSetp(true);
        return;
      }
      if (identificacaoTermos == false) {
        setError("Aceite os termos para continuar!");
        setState("initial");
        setButtonProgressSetp(true);
        return;
      }
      setButtonProgressSetp(false);
      setStepDadosValida(true);
      setState("success");
    }, 1000);
  };

  const handleVerificarCpf = (cpf: any) => {
    cpf = cpf.replace(/\D/g, '');
    if(cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var result = true;
    [9,10].forEach(function(j){
        var soma = 0, r;
        cpf.split(/(?=)/).splice(0,j).forEach(function(e:any, i:any){
            soma += parseInt(e) * ((j+2)-(i+1));
        });
        r = soma % 11;
        r = (r <2)?0:11-r;
        if(r != cpf.substring(j, j+1)) result = false;
    });
    return result;
}
  return (
    <>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Insira seu Nome e CPF
      </Heading>
      <FormControl>
        <Flex gap={2} direction={"column"}>
          <Input
            variant={"solid"}
            borderWidth={1}
            color={useColorModeValue("gray.800", "white.300")}
            _placeholder={{
              color: "gray.400",
            }}
            borderColor={useColorModeValue("gray.300", "gray.700")}
            id={"nome"}
            required
            placeholder={"Nome"}
            aria-label={"Nome"}
            value={identificacaoNome}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIdentificacaoNome(e.target.value.toUpperCase())
            }
          />
          <Input
            variant={"solid"}
            borderWidth={1}
            color={useColorModeValue("gray.800", "white.300")}
            _placeholder={{
              color: "gray.400",
            }}
            borderColor={useColorModeValue("gray.300", "gray.700")}
            id={"cnpj_cpf"}
            required
            placeholder={"CPF"}
            aria-label={"CPF"}
            value={identificacaoCpf}
            as={InputMask}
            mask={"999.999.999-99"}
            maskChar={null}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setIdentificacaoCpf(e.target.value)
            }
          />
          <Flex gap={1}>
            <Checkbox
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                handleCheckbox(e)
              }
              }
            >
              <Text>Aceite os</Text>
            </Checkbox>
            <Link color="teal.500" onClick={onOpen}>
              Termos de uso
            </Link>
          </Flex>
          <Modal
            isCentered
            onClose={onClose}
            isOpen={isOpen}
            motionPreset="slideInBottom"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Termos de uso</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              Eu, por meio deste documento, expresso minha plena concordância e autorização para a coleta e utilização da minha imagem facial e assinatura digital com a finalidade exclusiva de assinar documentos de forma eletrônica. Reconheço que esta medida visa facilitar e agilizar os processos de autenticação e formalização de acordos, proporcionando maior eficiência e segurança nas transações digitais. Estou ciente de que minha imagem facial e assinatura digital serão utilizadas estritamente para os fins mencionados e não serão compartilhadas ou utilizadas de maneira inadequada. Esta autorização tem validade a partir da presente data e permanece em vigor até eventual revogação por escrito. Declaro, ainda, que estou plenamente ciente das implicações legais deste consentimento. Assim, firmo meu acordo de forma voluntária e consciente.
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <FormControl w={"100%"}>
            <Button
              colorScheme={state === "success" ? "green" : "blue"}
              isLoading={state === "submitting"}
              w="100%"
              type={state === "success" ? "button" : "submit"}
              onClick={handleConfirmeDados}
            >
              {state === "success" ? <CheckIcon /> : "Confirmar"}
            </Button>
          </FormControl>
        </Flex>
      </FormControl>
      <Box marginTop={5}>
        {error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}
      </Box>
    </>
  );
}
