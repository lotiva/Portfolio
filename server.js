const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, subject, message } = req.body;

  if (!firstname || !lastname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailTo = process.env.MAIL_TO || 'loane.leroul@epitech.eu';

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(500).json({
      error: 'Le serveur mail n\'est pas configuré. Renseigne SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et MAIL_TO.',
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // verif SMTP connection av d'envoyé
  try {
    await transporter.verify();
    console.log('SMTP connection verified for', smtpUser);
  } catch (verifyErr) {
    console.error('SMTP verify failed:', verifyErr);
    return res.status(500).json({ error: 'Impossible de se connecter au serveur SMTP: ' + (verifyErr && verifyErr.message) });
  }

  try {
    await transporter.sendMail({
      from: `Portfolio <${smtpUser}>`,
      to: mailTo,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: [
        `Prénom: ${firstname}`,
        `Nom: ${lastname}`,
        `Email: ${email}`,
        `Objet: ${subject}`,
        '',
        message,
      ].join('\n'),
      html: `
        <h2>Nouveau message depuis le portfolio</h2>
        <p><strong>Prénom:</strong> ${firstname}</p>
        <p><strong>Nom:</strong> ${lastname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Objet:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('sendMail error:', error);
    return res.status(500).json({ error: error && error.message ? error.message : 'Impossible d\'envoyer le message pour le moment.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Portfolio running on http://localhost:${port}`);
});
