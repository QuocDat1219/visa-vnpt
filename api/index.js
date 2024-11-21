require("dotenv").config();
const express = require("express");
const cors = require("cors");
const visaRouter = require("../routes/visaRoutes");
const nginxRoutes = require("../routes/nginxRoutes");

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("ok api");
});

app.use("/api/visa", visaRouter);
app.use("/api/nginx", nginxRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:5055`);
});
