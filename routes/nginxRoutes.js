const express = require("express");
const router = express.Router();
const {
  getAllowedIP,
  createAllowedIP,
  deleteAllowedIP,
} = require("../service/IpNginxService");

router.get("/allowed-ips", getAllowedIP);

router.post('/allowed-ips', createAllowedIP);
router.delete('/allowed-ips/:ip', deleteAllowedIP);


module.exports = router;
