import connectToDatabase from "@/database/database";
import Arquivos from "@/database/models/arquivos";
import { NextApiRequest, NextApiResponse } from "next";

export async function apagarArquivosNaoAssinados(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();
    const quinzeDiasAtras = new Date();
    quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
    const arquivosDeletados = await Arquivos.deleteMany({
      ind_assinado: false,
      createdAt: { $lt: quinzeDiasAtras },
    });
    res.status(200).json(arquivosDeletados);
  } catch (error) {}
}
