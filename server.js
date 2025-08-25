import express from "express";
import { createTransport } from "nodemailer";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/send-email", (req, res) => {
  const { name, email, subject, message } = req.body;

  let templateHTML = fs.readFileSync(
    path.join(__dirname, "template.html"),
    "utf-8"
  );

  templateHTML = templateHTML.replace("{{name}}", name);
  templateHTML = templateHTML.replace("{{email}}", email);
  templateHTML = templateHTML.replace("{{message}}", message);

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  (async () => {
    try {
      const info = await transporter.sendMail({
        from: `${name} rizkyyullah1945@gmail.com`,
        to: "asyadi1945@gmail.com",
        subject: subject,
        html: templateHTML,
      });

      console.log(`Response : ${info.response}`);
      res.status(201).json({
        status: "Success",
        statusCode: 201,
        message: "Email has been sent successfully",
      });
    } catch (e) {
      res.status(res.statusCode).json({
        status: "Failed",
        statusCode: res.statusCode,
        message: "Email failed to send",
      });

      console.error("Something's wrong ", e);
    }
  })();
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
