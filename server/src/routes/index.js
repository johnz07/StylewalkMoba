const { Router } = require("express");
const db = require("../config/db");
const authController = require("../controllers/auth.controller");
const categoriasController = require("../controllers/categorias.controller");
const produtosController = require("../controllers/produtos.controller");
const { requireAdmin, requireAuth } = require("../middlewares/auth");

const router = Router();

// Saúde da API e do banco (útil para conferir se o app enxerga o servidor).
router.get("/health", async (req, res) => {
  await db.query("SELECT 1");
  res.json({ status: "ok" });
});

// Autenticação
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", requireAuth, authController.me);

// Catálogo (público)
router.get("/categorias", categoriasController.list);
router.get("/produtos", produtosController.list);
router.get("/produtos/:id", produtosController.getById);

// CRUD de produtos (só admin)
router.post("/produtos", requireAuth, requireAdmin, produtosController.create);
router.put("/produtos/:id", requireAuth, requireAdmin, produtosController.update);
router.delete("/produtos/:id", requireAuth, requireAdmin, produtosController.remove);

module.exports = router;
