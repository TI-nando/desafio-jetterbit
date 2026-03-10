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

// --- CONFIGURAÇÃO DO BANCO (Substitua com seus dados do Atlas) ---
const dbUser = "fernando_dev";
const dbPass = "Fernando1520";
const dbName = "jitterbit_db";

const uri = `mongodb+srv://${dbUser}:${dbPass}@cluster0.g0olhhz.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao Atlas:", err));

// --- ENDPOINTS OBRIGATÓRIOS ---

// 1. Criar um novo pedido
app.post("/order", async (req, res) => {
  try {
    const data = req.body;

    // Mapping dos campos (Português -> Inglês)
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
    res.status(201).json(newOrder); // Status 201: Created
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: "Erro ao criar pedido", erro: error.message });
  }
});

// 2. Obter dados por parâmetro na URL
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

// Listar todos os pedidos
app.get("/order/list", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
