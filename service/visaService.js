const soap = require("soap");
require("dotenv").config();

const urlV1 = process.env.WSLDV1;

const getInfoUser = async (req, res) => {
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
            return res.status(500).json({ error: "Error creating SOAP client" });
        }

        client.lookupRASAccount(argV1, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error calling SOAP service", details: err.message });
            }

            // Kiểm tra lỗi từ kết quả trả về
            if (result.lookupRASAccountReturn.errorCode === 'error.resource.not.exist') {
                return res.status(404).json({ error: "User not found" });
            }

            // Xử lý kết quả khi thành công
            const data = JSON.parse(result.lookupRASAccountReturn.lookupRASAccountReturn[2].dslamParamInfo["$value"]);
            console.log(data);
            
            const SystemName = data.systemid;
            const FrameNo = data.selfid.toString().replace(/^0+/, '');
            const SlotNo = data.slot.toString().replace(/^0+/, '');
            const PortNo = data.port.toString().replace(/^0+/, '');
            const OnuIndex = data.vpi.toString().replace(/^0+/, '');

            const responseObject = [{
                "SystemName": SystemName,
                "FrameNo": Number(FrameNo),
                "SlotNo": Number(SlotNo),
                "PortNo": Number(PortNo),
                "OnuIndex": Number(OnuIndex)
            }];

            res.status(200).json(responseObject);
        });
    });
};

module.exports = {
    getInfoUser,
};
