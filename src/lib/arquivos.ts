import connectToDatabase from "@/database/database";
import Arquivos from "@/database/models/arquivos";
import { NextApiRequest } from "next";

export async function getArquivos(req: any, res: any) {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 10;

  try {
    await connectToDatabase();

    const startIndex = (page - 1) * perPage;

    const arquivosEncontrados = await Arquivos.find()
      .skip(startIndex)
      .limit(perPage);

    res.status(200).json(arquivosEncontrados);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter os Arquivos" });
  }
  return res;
}

export async function getArquivosById(
  { id, md5, ind_assinado }: any,
  res: any
) {
  try {
    await connectToDatabase();

    if (!id && !md5) {
      return res.status(400).json({
        error: "Pelo menos um dos parâmetros 'id' ou 'md5' é obrigatório",
      });
    }

    let query: Record<string, any> = {};

    if (ind_assinado) {
      query.ind_assinado = ind_assinado;
    }

    if (id) {
      query.id_externo = id;
    }

    if (md5) {
      query["docs.md5"] = md5;
    }
    const arquivosById = await Arquivos.findOne(query);

    if (!arquivosById) {
      return res.status(200).json({ message: "Arquivo não encontrado" });
    }

    res.status(200).json(arquivosById);
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter o Arquivo" });
  }
}

export async function postArquivos(req: any, res: any) {
  console.log("Post iniciado");
  const {
    cnpj_empresa,
    cpf_cliente,
    id_externo,
    docs,
    ind_assinado,
    nome_cliente,
    assinaturaAt,
  } = req.body;
  try {
    console.log(`Iniciando postagem documento id_externo: ${id_externo}`);
    let query: Record<string, any> = {};

    for (const doc of docs) {
      if (doc.type != "NFE" && doc.type != "BLF" && doc.type != "CT") {
        console.log(
          'Erro: Tipo de arquivo não compativel. Documentos aceitos "NFE", "BLF", "CT".'
        );
        return res.status(400).json({
          error:
            'Tipo de arquivo não compativel. Documentos aceitos "NFE", "BLF", "CT".',
        });
      }
    }

    if (!cnpj_empresa) {
      console.log('Erro: O campo "cnpj_empresa" é obrigatório.');
      return res
        .status(400)
        .json({ error: 'O campo "cnpj_empresa" é obrigatório.' });
    }

    if (ind_assinado === null || ind_assinado === undefined) {
      console.log('Erro: O campo "ind_assinado" é obrigatório.');
      return res
        .status(400)
        .json({ error: 'O campo "ind_assinado" é obrigatório.' });
    }

    if (!docs || docs.length === 0) {
      console.log('Erro: O campo "docs" é obrigatório.');
      return res.status(400).json({ error: 'O campo "docs" é obrigatório.' });
    }

    if (!id_externo) {
      console.log('Erro: O campo "id_externo" é obrigatório.');
      return res
        .status(400)
        .json({ error: 'O campo "id_externo" é obrigatório.' });
    }
    query.id_externo = id_externo;

    await connectToDatabase();

    const arquivoExistente = await Arquivos.findOne(query);

    if (arquivoExistente) {
      console.log(`Documento de id_externo: ${id_externo} existente.`);
      return res.status(200).json();
    }

    const newArquivos = {
      cnpj_empresa,
      cpf_cliente,
      id_externo,
      docs,
      ind_assinado,
      nome_cliente,
      assinaturaAt,
    };
    await Arquivos.create(newArquivos);
    console.log(`Documento criado id_externo: ${id_externo}`);
    res.status(200).json({ message: "Arquivos criado com sucesso" });
  } catch (error) {
    console.log(`Erro ao criar documento id_externo: ${id_externo}`);
    res.status(500).json({ error: "Erro ao criar o arquivos" });
  }
  return res;
}

export async function updateArquivos(req: NextApiRequest, res: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ error: 'O parâmetro "id" é obrigatório para atualização' });
    }
    let query: Record<string, any> = {};
    query.id_externo = id;
    const { cpf_cliente, docs, ind_assinado, nome_cliente, assinaturaAt, ip } =
      req.body;

    await connectToDatabase();

    const arquivoExistente = await Arquivos.findOne(query);
    if (!arquivoExistente) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    arquivoExistente.ind_assinado = ind_assinado;
    arquivoExistente.docs = docs;
    arquivoExistente.assinaturaAt = assinaturaAt;
    arquivoExistente.nome_cliente = nome_cliente;
    arquivoExistente.cpf_cliente = cpf_cliente;
    arquivoExistente.dispositivo = req.headers["user-agent"];
    arquivoExistente.ip = ip;

    await arquivoExistente.save();

    res
      .status(200)
      .json({ arquivoExistente, message: "Arquivo atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o arquivo" });
  }
}
