import { sendTransactionalEmail } from "../services/emailDelivery.js";

export const sendOTPEmail = async (toEmail, otp) => {
  const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="margin-bottom: 24px;">
          <span style="font-weight: 700; font-size: 20px; color: #0d9488; letter-spacing: -0.5px;">MediMind AI</span>
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-top: 4px;">Account Security</span>
        </div>
        <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 12px; font-weight: 600;">Password Reset Verification</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          We received a request to reset your password. Use the verification code below to securely complete your reset:
        </p>
        <div style="background: #f0fdfa; border: 1.5px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #0d9488; margin-bottom: 6px;">Your 6-Digit OTP</span>
          <h1 style="font-size: 38px; letter-spacing: 10px; color: #0f172a; margin: 0; font-family: monospace; font-weight: 700;">${otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
          ⏳ <strong>Valid for 5 minutes</strong>. Maximum 3 verification attempts.<br/>
          If you did not request this password reset, you can safely ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} MediMind AI Platform. Automated security dispatch.
        </p>
      </div>
    `;

  try {
    await sendTransactionalEmail({
      to: toEmail,
      subject: "MediMind AI – Password Reset OTP",
      html,
    });
    return true;
  } catch (err) {
    console.error(`[sendOTPEmail] Password reset email delivery failed: ${err.message}`);
    throw err;
  }
};
