import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors()); // allow all origins; tighten if needed

app.get("/", (req, res) => {
  res.json({ ok: true, service: "Farley Flooring Timecard Email API" });
});

app.post("/api/send", async (req, res) => {
  const { pdfBase64, filename, to, subject, text } = req.body;
  if (!pdfBase64 || !filename || !to) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: subject || "Weekly Timecard",
      text: text || "See attached timecard PDF.",
      attachments: [{ filename, content: Buffer.from(pdfBase64, "base64") }],
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("Email error:", e);
    res.status(500).json({ ok: false, error: "Email failed" });
  }
});

// --- TEST EMAIL ROUTE ---
app.get("/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "farleyflooring@yahoo.com",
      subject: "✅ Farley Flooring Timecard Test Email",
      text: "This is a test email confirming your backend email setup works!",
    });

    res.json({ ok: true, message: "Test email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
