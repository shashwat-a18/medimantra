const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP)
  // In production, replace with actual SMTP settings
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
      pass: process.env.SMTP_PASS || 'ethereal.pass'
    }
  });
};

// Send reminder email
const sendReminderEmail = async (to, userName, reminder) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@medimitra.com',
      to: to,
      subject: `Health Reminder: ${reminder.title}`,
      html: generateReminderEmailTemplate(userName, reminder)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Send reminder email error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (to, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@medimitra.com',
      to: to,
      subject: 'Welcome to Medical Health Tracker – Pro',
      html: generateWelcomeEmailTemplate(userName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
};

// Send high-risk alert email
const sendHighRiskAlert = async (to, userName, predictionResult) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@medimitra.com',
      to: to,
      subject: `Health Alert: High Risk Detected - ${predictionResult.predictionType}`,
      html: generateHighRiskAlertTemplate(userName, predictionResult)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('High-risk alert email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Send high-risk alert email error:', error);
    throw error;
  }
};

// Generate reminder email template
const generateReminderEmailTemplate = (userName, reminder) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 20px; }
            .reminder-box { background-color: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Health Reminder</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>This is a reminder from your Medical Health Tracker:</p>
                
                <div class="reminder-box">
                    <h3>${reminder.title}</h3>
                    <p><strong>Type:</strong> ${reminder.reminderType}</p>
                    <p><strong>Message:</strong> ${reminder.message}</p>
                    <p><strong>Scheduled:</strong> ${new Date(reminder.scheduledDateTime).toLocaleString()}</p>
                    ${reminder.metadata.medicationName ? `<p><strong>Medication:</strong> ${reminder.metadata.medicationName}</p>` : ''}
                    ${reminder.metadata.dosage ? `<p><strong>Dosage:</strong> ${reminder.metadata.dosage}</p>` : ''}
                </div>
                
                <p>Take care of your health!</p>
                <a href="#" class="btn">View in App</a>
            </div>
            <div class="footer">
                <p>Medical Health Tracker – Pro</p>
                <p>This is an automated message. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate welcome email template
const generateWelcomeEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 20px; }
            .feature { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Medical Health Tracker – Pro!</h1>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>Welcome to your personal health management platform! We're excited to help you take control of your health journey.</p>
                
                <h3>What you can do:</h3>
                <div class="feature">
                    <h4>📊 Track Health Data</h4>
                    <p>Record and monitor your vital signs, symptoms, and medications.</p>
                </div>
                
                <div class="feature">
                    <h4>🤖 AI Health Predictions</h4>
                    <p>Get personalized health risk assessments using machine learning.</p>
                </div>
                
                <div class="feature">
                    <h4>📄 Document Management</h4>
                    <p>Upload and organize your medical documents securely.</p>
                </div>
                
                <div class="feature">
                    <h4>💬 AI Health Assistant</h4>
                    <p>Chat with our AI assistant for health guidance and information.</p>
                </div>
                
                <div class="feature">
                    <h4>⏰ Smart Reminders</h4>
                    <p>Set up medication and appointment reminders.</p>
                </div>
                
                <p>Start exploring your dashboard to begin your health tracking journey!</p>
                <a href="#" class="btn">Get Started</a>
            </div>
            <div class="footer">
                <p>Medical Health Tracker – Pro</p>
                <p>Your health, our priority.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate high-risk alert email template
const generateHighRiskAlertTemplate = (userName, predictionResult) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 20px; }
            .alert-box { background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
            .recommendations { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Health Alert</h1>
            </div>
            <div class="content">
                <h2>Dear ${userName},</h2>
                <p>Our AI analysis has detected a high health risk that requires your attention.</p>
                
                <div class="alert-box">
                    <h3>High Risk Detected: ${predictionResult.predictionType.toUpperCase()}</h3>
                    <p><strong>Risk Level:</strong> ${predictionResult.result.riskLevel.toUpperCase()}</p>
                    <p><strong>Confidence:</strong> ${Math.round(predictionResult.result.probability * 100)}%</p>
                    <p><strong>Analysis Date:</strong> ${new Date(predictionResult.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div class="recommendations">
                    <h3>Recommended Actions:</h3>
                    <ul>
                        ${predictionResult.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <p><strong>Important:</strong> This is an automated health assessment. Please consult with a healthcare professional for proper medical advice and treatment.</p>
                
                <a href="#" class="btn">View Full Report</a>
            </div>
            <div class="footer">
                <p>Medical Health Tracker – Pro</p>
                <p>This is an automated alert. Please consult your healthcare provider.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendReminderEmail,
  sendWelcomeEmail,
  sendHighRiskAlert
};
