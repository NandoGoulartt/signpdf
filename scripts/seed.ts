import Arquivos from "../src/database/models/arquivos";
import mongoose from "mongoose";
import { arquivo } from "./fixtures/arquivo";

const dbUrl = "mongodb://localhost:27017/signpdf";

async function seed() {
  try {
    await mongoose.connect(dbUrl!);

    await Arquivos.deleteMany({});

    await Arquivos.insertMany(arquivo);

    console.log("Dados inseridos com sucesso!");
  } catch (error) {
    console.error("Erro ao inserir dados:", error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
