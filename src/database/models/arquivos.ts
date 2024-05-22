import mongoose, { Schema } from "mongoose";

const docsSchema = new Schema({
  type: String,
  md5: String,
  base64: String,
  qtd_paginas: Number,
});

const arquivosShema = new Schema(
  {
    cnpj_empresa: String,
    cpf_cliente: String,
    nome_cliente: String,
    id_externo: String,
    docs: [docsSchema],
    ind_assinado: Boolean,
    assinaturaAt: String,
    dispositivo: String,
    ip: String,
  },
  {
    timestamps: true,
  }
);

const Arquivos = mongoose.models?.arquivos || mongoose.model("arquivos", arquivosShema);

export default Arquivos;
