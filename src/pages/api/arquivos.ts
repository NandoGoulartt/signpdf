import {
  getArquivos,
  getArquivosById,
  postArquivos,
  updateArquivos,
} from "@/lib/arquivos";
import type { NextApiRequest, NextApiResponse } from 'next'



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try{
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const [bearer, token] = authorizationHeader.split(" ");
      if (token === process.env.NEXT_PUBLIC_API_TOKEN && token) {
        if (req.method === "GET") {
          const { query } = req;
          const { id, md5, ind_assinado } = query;
          if (id || md5) {
            await getArquivosById({ id, md5, ind_assinado }, res);
          } else {
            await getArquivos(req, res);
          }
        } else if (req.method === "POST") {
          console.log('Iniciando post'); 
          await postArquivos(req, res);
        } else if (req.method === "PUT") {
          await updateArquivos(req, res);
        } else {
          res.status(405).end();
        }
      } else {
        res.status(401).json({ message: "Token Bearer inválido" });
      }
    } else {
      res.status(401).json({ message: "Token Bearer não fornecido" });
    }
  }catch (error) {
    if (error instanceof Error) {
      console.error('Erro:', error.message); 
      res.status(400).json({ error: 'Erro ao criar o arquivo', message: error.message }); 
    } else {
      console.error('Erro desconhecido:', error);
      res.status(400).json({ error: 'Erro desconhecido ao criar o arquivo' });
    }
  }

}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};