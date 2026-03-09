const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

// Conexão com MongoDB (Substitua pela sua string de conexão)
mongoose
  .connect("mongodb://localhost:27017/jitterbit_db")
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro de conexão:", err));

// [OBRIGATÓRIO] Criar um novo pedido - URL: http://localhost:3000/order
app.post("/order", async (req, res) => {
  try {
    const data = req.body;

    // Mapping dos campos conforme solicitado
    const orderData = {
      orderId: data.numeroPedido,
      value: data["valor Total"], // O JSON de entrada tem espaço no nome
      creationDate: new Date(data.dataCriacao),
      items: data.items.map((item) => ({
        productId: parseInt(item.idItem || item.idltem),
        quantity: item.quantidadeltem,
        price: item.valorltem,
      })),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json(newOrder); // Resposta HTTP adequada [cite: 313]
  } catch (error) {
    res
      .status(400)
      .json({ mensagem: "Erro ao criar pedido", erro: error.message });
  }
});

// [OBRIGATÓRIO] Obter dados por parâmetro na URL [cite: 228]
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

// [OPCIONAL] Listar todos os pedidos [cite: 230, 231]
app.get("/order/list", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
