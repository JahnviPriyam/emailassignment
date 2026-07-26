import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/config';

let transporter: Transporter | null = null;
let etherealAccount: nodemailer.TestAccount | null = null;

export const getMailer = async (): Promise<Transporter> => {
  if (transporter) return transporter;

  if (config.smtp.user && config.smtp.pass) {
    console.log(`[SMTP] Using configured SMTP account: ${config.smtp.user} (${config.smtp.host})`);
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  } else {
    console.log('[SMTP] No SMTP credentials in .env. Generating Ethereal Email test account...');
    etherealAccount = await nodemailer.createTestAccount();
    console.log(`[SMTP] Generated Ethereal account: ${etherealAccount.user}`);
    console.log(`[SMTP] Webmail URL: ${etherealAccount.web}`);
    
    transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
  }

  return transporter;
};

export const sendEmail = async (to: string, subject: string, body: string, sender: string) => {
  const mailer = await getMailer();
  const info = await mailer.sendMail({
    from: `"${sender}" <${config.smtp.user || etherealAccount?.user || 'sender@reachinbox.ai'}>`,
    to,
    subject,
    text: body,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
             <div style="white-space: pre-wrap;">${body}</div>
             <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
             <p style="font-size: 12px; color: #888;">Sent via ReachInbox Email Job Scheduler</p>
           </div>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email Sent] Preview URL for recipient ${to}: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl };
};
