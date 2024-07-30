const soap = require("soap");
require("dotenv").config();

//.env
// WSLDV1 = http://10.156.7.25/visa/services/ApplicationBusinessServices?wsdl
// WSLDV2 = http://10.156.7.25/visa/services/v2.0/customer?wsdl

// PORT = 5000

const urlV1 = process.env.WSLDV1;
const urlV2 = process.env.WSLDV2;

const username = process.env.VISA_USERNAME_V1;
const password = process.env.VISA_PASSWORD_V1;

// Tạo security context
const security = new soap.WSSecurity(username, password);

const openSuspendService = async (req, res) => {
  const argV1 = {
    login: {
      userId: process.env.VISA_USERNAME_V1,
      password: process.env.VISA_PASSWORD_V1,
    },
    accountName: req.body.username,
  };

  soap.createClient(urlV1, (err, client) => {
    if (err) {
      console.error(err);
      return;
    }

    client.lookupRASAccount(argV1, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // const user_id =
      //   result.lookupRASAccountReturn.lookupRASAccountReturn[2].accountId[
      //     "$value"
      //   ];
      const user_id =
        result.lookupRASAccountReturn.lookupRASAccountReturn[1].id["$value"];
      // Khởi tạo đúng đối tượng arg0 theo cấu trúc PackageCustomer trong WSDL
      const packageCustomer = {
        code: user_id.toString(),
        //reason: 1, // Lý do khóa, lấy mã lý do từ danh mục chung
        // description: "Bot telegram mở cước, User yêu cầu : Thắng",
      };

      soap.createClient(urlV2, (err, client) => {
        if (err) {
          console.error(err);
          return;
        }

        // Thêm security context vào client
        client.setSecurity(security);

        client.get({ arg0: packageCustomer }, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }
          if (result) {
            console.log(result);
            res.status(200).send(result);
          }
        });
      });
    });
  });
};

//Lấy thông tin tài khoản
const getStatusAccountService = async (req, res) => {
  const argV1 = {
    login: {
      userId: process.env.VISA_USERNAME_V1,
      password: process.env.VISA_PASSWORD_V1,
    },
    accountName: req.body.username,
  };

  soap.createClient(urlV1, (err, client) => {
    if (err) {
      console.error(err);
      return;
    }

    client.lookupRASAccount(argV1, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const user_id =
        result.lookupRASAccountReturn.lookupRASAccountReturn[0].status[
          "$value"
        ];
      console.log(result.lookupRASAccountReturn.lookupRASAccountReturn);
      const data =
        result.lookupRASAccountReturn.lookupRASAccountReturn[2].dslamParamInfo[
          "$value"
        ];
      res.status(200).json(JSON.parse(data));
    });
  });
};

module.exports = {
  openSuspendService,
  getStatusAccountService,
};
