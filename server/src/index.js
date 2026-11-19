const app = require("./app");
const env = require("./config/env");

// 0.0.0.0: aceita conexões da rede local (celular com Expo Go no mesmo Wi-Fi).
app.listen(env.port, "0.0.0.0", () => {
  console.log(`Servidor na porta ${env.port}`);
});
