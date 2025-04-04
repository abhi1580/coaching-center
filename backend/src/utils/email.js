import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email configuration is missing. Please check your .env file.");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Define email options
    const message = {
      from: `${process.env.EMAIL_FROM_NAME || 'Coaching Center'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message, // Support HTML content if provided
    };

    // Send email
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}; 