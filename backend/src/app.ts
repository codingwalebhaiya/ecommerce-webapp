import express from "express";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1", routes)

app.get("/", (_req, res) => {
  res.send("API running 🚀");
});

app.use(errorMiddleware);

export default app;