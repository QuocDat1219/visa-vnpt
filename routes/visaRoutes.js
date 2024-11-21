const express = require("express");
const router = express.Router();
const {
  getInfoUser,
} = require("../service/visaService");

router.post("/user", getInfoUser);




module.exports = router;
