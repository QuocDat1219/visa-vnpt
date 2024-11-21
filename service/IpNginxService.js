
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const getAllowedIP = async (req, res) => {
    try {
        // Đường dẫn tới file cấu hình chứa danh sách IP
        const ipFilePath = path.resolve('C:\\Tool\\nginx-1.25.5\\conf\\allowed_ips.conf');

        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(ipFilePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Đọc nội dung file
        const fileContent = fs.readFileSync(ipFilePath, 'utf8');

        // Tách từng dòng và lọc ra các dòng chứa IP
        const ipList = fileContent
            .split('\n')
            .filter(line => line.startsWith('allow'))
            .map(line => line.replace('allow', '').replace(';', '').trim());

        // Trả về danh sách IP dưới dạng JSON
        return res.status(200).json({ allowedIPs: ipList });
    } catch (error) {
        console.error('Error reading allowed IPs:', error);
        return res.status(500).json({ message: 'Internal server error', error: error });
    }
};
const createAllowedIP = async (req, res) => {
    try {
        const ipFilePath = path.resolve('C:\\Tool\\nginx-1.25.5\\conf\\allowed_ips.conf');
        const { ip } = req.body;
        console.log(ip);

        // Kiểm tra IP có được truyền vào không
        if (!ip) {
            return res.status(400).json({ message: 'IP address is required' });
        }

        // Kiểm tra file tồn tại, nếu không thì tạo file trống
        if (!fs.existsSync(ipFilePath)) {
            fs.writeFileSync(ipFilePath, '', 'utf8');
        }

        // Đọc nội dung file
        const fileContent = fs.readFileSync(ipFilePath, 'utf8');
        const ipList = fileContent
            .split(/\r?\n/) // Hỗ trợ cả \n và \r\n
            .filter(line => line.startsWith('allow'))
            .map(line => line.replace('allow', '').replace(';', '').trim());

        // Kiểm tra nếu IP đã tồn tại
        if (ipList.includes(ip)) {
            return res.status(409).json({ message: `IP ${ip} already exists` });
        }

        // Ghép thêm IP mới vào nội dung file
        const updatedContent = (fileContent.trim() + `\r\nallow ${ip};`).trim() + '\r\n';

        // Ghi lại toàn bộ nội dung vào file
        fs.writeFileSync(ipFilePath, updatedContent, 'utf8');

        // Reload Nginx để áp dụng thay đổi
        reloadNginx();

        return res.status(201).json({ message: `IP ${ip} added successfully` });
    } catch (error) {
        console.error('Error adding IP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const deleteAllowedIP = async (req, res) => {
    try {
        const ipFilePath = path.resolve('C:\\Tool\\nginx-1.25.5\\conf\\allowed_ips.conf');
        const { ip } = req.params;

        // Kiểm tra IP có được truyền vào không
        if (!ip) {
            return res.status(400).json({ message: 'IP address is required' });
        }

        // Đọc nội dung file
        const fileContent = fs.readFileSync(ipFilePath, 'utf8');
        const updatedContent = fileContent
            .split('\n')
            .filter(line => !line.includes(`allow ${ip};`))
            .join('\n');

        // Ghi lại file với nội dung đã cập nhật
        fs.writeFileSync(ipFilePath, updatedContent);

        // Reload Nginx để áp dụng thay đổi
        reloadNginx();

        return res.status(200).json({ message: `IP ${ip} removed successfully` });
    } catch (error) {
        console.error('Error removing IP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
const reloadNginx = () => {
    // Đường dẫn tới thư mục Nginx
    const nginxPath = path.resolve('C:\\Tool\\nginx-1.25.5');

    // Lệnh reload Nginx
    const command = 'nginx -s reload';

    // Chạy lệnh trong thư mục Nginx
    exec(command, { cwd: nginxPath }, (err, stdout, stderr) => {
        if (err) {
            console.error('Error reloading Nginx:', stderr);
        } else {
            console.log('Nginx reloaded successfully:', stdout);
        }
    });
};

module.exports = {
    getAllowedIP,
    createAllowedIP,
    deleteAllowedIP,
    reloadNginx
};