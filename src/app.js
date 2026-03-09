const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

// Conexão com MongoDB
mongoose
  .connect("mongodb://localhost:27017/jitterbit_db")
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro de conexão:", err));

// --- ENDPOINTS OBRIGATÓRIOS ---

// 1. Criar um novo pedido [cite: 227]
app.post("/order", async (req, res) => {
  try {
    const data = req.body;

    // Mapping dos campos (Português -> Inglês) [cite: 265, 266]
    const orderData = {
      orderId: data.numeroPedido,
      value: data["valor Total"],
      creationDate: new Date(data.dataCriacao),
      items: data.items.map((item) => ({
        productId: parseInt(item.idItem || item.idltem),
        quantity: item.quantidadeltem,
        price: item.valorltem,
      })),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder); // Status 201: Created [cite: 313]
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: "Erro ao criar pedido", erro: error.message });
  }
});

// 2. Obter dados por parâmetro na URL [cite: 228]
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

// --- ENDPOINTS OPCIONAIS ---

// Listar todos os pedidos [cite: 230]
app.get("/order/list", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
}); // Removi a chave extra que estava aqui

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
