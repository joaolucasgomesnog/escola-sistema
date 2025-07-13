import axios from "axios";
import express from "express";
import { routes } from "./routes/index.js";
import cors from "cors";

const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,PUT,POST,DELETE",
    optionsSuccessStatus: 204,
  })
);

app.use(routes);

app.get("/", (req, res) => {
  return res.json({ status: "Servidor rodando" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);


  const url = "https://seuapp.onrender.com/healthz";
  const intervalMs = 14 * 60 * 1000; // 14 minutos

  setInterval(async () => {
    try {
      const res = await axios.get(url);
      console.log(`[Ping] ${new Date().toISOString()} – status ${res.status}`);
    } catch (err) {
      console.error(`[Ping] Erro ao pingar:`, err.message);
    }
  }, intervalMs);
});
