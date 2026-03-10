const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/Order");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config();

const app = express();
app.use(express.json());

let uri =
  process.env.MONGO_URI ||
  "mongodb://fernando_dev:Fernando1520@cluster0-shard-00-00.g0olhhz.mongodb.net:27017,cluster0-shard-00-01.g0olhhz.mongodb.net:27017,cluster0-shard-00-02.g0olhhz.mongodb.net:27017/jitterbit_db?ssl=true&replicaSet=atlas-g0olhhz-shard-0&authSource=admin&retryWrites=true&w=majority";

async function init() {
  try {
    if (!process.env.MONGO_URI) {
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log("Mongo em memória inicializado");
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("Conexão com o banco estabelecida");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  } catch (err) {
    console.error("Falha ao iniciar aplicação:", err.message);
    process.exit(1);
  }
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
}

function toNumber(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(t);
    if (!Number.isNaN(n)) return n;
  }
}

app.post("/order", async (req, res) => {
  try {
    const data = req.body;

    if (!data || !Array.isArray(data.items)) {
      return res
        .status(400)
        .json({ mensagem: "Formato inválido: items deve ser uma lista" });
    }

    const orderData = {
      orderId: String(data.numeroPedido ?? data.orderId),
      value: toNumber(pick(data, ["valor Total", "valorTotal", "value"])),
      creationDate: new Date(
        pick(data, ["dataCriacao", "creationDate"]) ?? Date.now(),
      ),
      items: data.items.map((item) => ({
        productId: parseInt(pick(item, ["idItem", "idltem", "productId"])),
        quantity: toNumber(
          pick(item, ["quantidadeItem", "quantidadeltem", "quantity"]),
        ),
        price: toNumber(pick(item, ["valorItem", "valorltem", "price"])),
      })),
    };

    if (
      !orderData.orderId ||
      typeof orderData.value !== "number" ||
      !(orderData.creationDate instanceof Date) ||
      orderData.items.some(
        (i) =>
          Number.isNaN(i.productId) ||
          typeof i.quantity !== "number" ||
          typeof i.price !== "number",
      )
    ) {
      return res.status(400).json({ mensagem: "Dados de pedido inválidos" });
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    if (error && error.code === 11000) {
      return res
        .status(409)
        .json({ mensagem: "Pedido já existe", erro: "duplicado" });
    }
    res
      .status(400)
      .json({ mensagem: "Erro ao criar pedido", erro: error.message });
  }
});

app.get("/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ mensagem: "Pedido não encontrado" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
});

app.get("/order/list", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ dbState: mongoose.connection.readyState });
});

init();
