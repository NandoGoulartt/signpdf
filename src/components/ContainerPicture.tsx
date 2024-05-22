import { ImagePreview } from "@/components/ImagePreview";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

export default function ContainerPicture({
  fotografia,
  setFotografia,
  setButtonProgressSetp,
}: any) {
  const [stepDadosValida, setStepDadosValida] = useState(false);
  const [state, setState] = useState<"initial" | "submitting" | "success">(
    "initial"
  );
  const [error, setError] = useState<String | boolean>(false);

  // useEffect(() => {
  //   if (!stepDadosValida) {
  //     setButtonProgressSetp(true);
  //   }
  // });

  function handleTakePhotoAnimationDone(dataUri: any) {
    compressAndSetImage(dataUri);
  }

  const compressAndSetImage = (dataUri: any) => {
    const img = new Image();
    img.src = dataUri;

    img.onload = () => {
      const maxWidth = 800; 
      const maxHeight = 800; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (ctx) { 
        ctx.drawImage(img, 0, 0, width, height);
  
        const compressedDataUri = canvas.toDataURL("image/jpeg", 0.7); 
  
        setFotografia(compressedDataUri);
      }
    };
  };

  const handleConfirmeDados = () => {
    setError(false);
    setState("submitting");

    setTimeout(() => {
      if (!fotografia) {
        setError("Bata uma foto para prosseguir!");
        setState("initial");
        setButtonProgressSetp(true);
        return;
      }
      setButtonProgressSetp(false);
      setStepDadosValida(true);
      setState("success");
    }, 1000);
  };

  const handleRefazerFoto = () => {
    setFotografia("");
    setState("initial");
    setButtonProgressSetp(true);
    setStepDadosValida(false);
  };

  const isFullscreen = false;
  return (
    <Flex gap={2} direction={"column"}>
      <div>
        {fotografia ? (
          <ImagePreview dataUri={fotografia} isFullscreen={isFullscreen} />
        ) : (
          <Camera
            onTakePhotoAnimationDone={handleTakePhotoAnimationDone}
            isFullscreen={isFullscreen}
          />
        )}
      </div>

      <FormControl w={"100%"}>
        <Flex gap={2}>
          <Button
            colorScheme={state === "success" ? "green" : "blue"}
            isLoading={state === "submitting"}
            w="100%"
            isDisabled={fotografia ? false : true}
            type={state === "success" ? "button" : "submit"}
            onClick={handleConfirmeDados}
          >
            {state === "success" ? <CheckIcon /> : "Confirmar"}
          </Button>
          <Button
            colorScheme={"red"}
            w="100%"
            isDisabled={fotografia ? false : true}
            type={"button"}
            onClick={handleRefazerFoto}
          >
            Refazer foto
          </Button>
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
    </Flex>
  );
}