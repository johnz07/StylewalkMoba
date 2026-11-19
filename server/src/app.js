// App Express sem o listen: o index.js sobe o servidor e os testes usam o app direto.
const path = require("path");
const cors = require("cors");
const express = require("express");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();

// Atrás do proxy do Render, garante https nas URLs das imagens.
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

app.get("/", (req, res) => {
  res.json({ message: "API StyleWalk rodando!" });
});
app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
