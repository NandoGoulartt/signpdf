import { apagarArquivosNaoAssinados } from "@/lib/rotinas";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const [bearer, token] = authorizationHeader.split(" ");
      if (token === process.env.NEXT_PUBLIC_API_TOKEN && token) {
        if (req.method === "DELETE") {
          await apagarArquivosNaoAssinados(req, res);
        } else {
          res.status(405).end();
        }
      } else {
        res.status(401).json({ message: "Token Bearer inválido" });
      }
    } else {
      res.status(401).json({ message: "Token Bearer não fornecido" });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro:", error.message);
      res
        .status(400)
        .json({ error: "Erro ao rodar Rotina", message: error.message });
    } else {
      console.error("Erro desconhecido:", error);
      res.status(400).json({ error: "Erro desconhecido ao rodar Rotina" });
    }
  }
}
