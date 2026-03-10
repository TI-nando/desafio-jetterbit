const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

// --- CONFIGURAÇÃO DO BANCO ---
const dbUser = "fernando_dev";
const dbPass = "Fernando1520";
const dbName = "jitterbit_db";

// Use apenas esta conexão para o MongoDB Atlas [cite: 234]
const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.g0olhhz.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao Atlas:", err.message));

// --- ENDPOINTS OBRIGATÓRIOS ---

// 1. Criar um novo pedido - URL: http://localhost:3000/order [cite: 227]
app.post("/order", async (req, res) => {
  try {
    const data = req.body;

    // Mapping: transforma os campos do JSON de entrada para o formato do banco [cite: 266, 276]
    const orderData = {
      orderId: data.numeroPedido,
      value: data["valor Total"], // Campo com espaço conforme o PDF [cite: 254]
      creationDate: new Date(data.dataCriacao),
      items: data.items.map((item) => ({
        productId: parseInt(item.idItem || item.idltem), // Trata variações de digitação [cite: 245, 258]
        quantity: item.quantidadeltem,
        price: item.valorltem,
      })),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder); // Resposta HTTP 201: Sucesso na criação [cite: 199, 313]
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: "Erro ao criar pedido", erro: error.message });
  }
});

// 2. Obter dados por parâmetro na URL - URL: http://localhost:3000/order/:id [cite: 228]
app.get("/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ mensagem: "Pedido não encontrado" }); // [cite: 200]
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
});

// --- ENDPOINTS OPCIONAIS ---

// Listar todos os pedidos [cite: 230]
app.get("/order/list", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
