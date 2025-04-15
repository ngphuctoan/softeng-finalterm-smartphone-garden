import express from "express";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, world!");
});

app.use("/api/v1", authRoutes);

export default app;