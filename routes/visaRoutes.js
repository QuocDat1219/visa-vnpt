const express = require("express");
const router = express.Router();
const {
  openSuspendService,
  getStatusAccountService,
} = require("../service/visaService");

router.post("/status", getStatusAccountService);
router.post("/open", openSuspendService);

module.exports = router;
