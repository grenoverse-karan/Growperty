/// <reference path="../pb_data/types.d.ts" />

/**
 * Schema Analysis Report Hook
 * Sends email notifications when new schema analysis reports are submitted
 */

onRecordAfterCreateSuccess((e) => {
  try {
    // Get the submitted record data
    const reportType = e.record.get("reportType") || "General";
    const userEmail = e.record.get("email") || "";
    const userName = e.record.get("name") || "User";
    const userPhone = e.record.get("phone") || "Not provided";
    const message = e.record.get("message") || "No message provided";
    const recordId = e.record.id;

    // Admin notification email
    const adminMessage = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: "admin@example.com" }], // Replace with actual admin email
      subject: `New Schema Analysis Report: ${reportType}`,
      html: `
        <h2>New Schema Analysis Report Submitted</h2>
        <p><strong>Report Type:</strong> ${reportType}</p>
        <p><strong>Submitted by:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${userPhone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><small>Record ID: ${recordId}</small></p>
        <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
      `
    });

    // User confirmation email
    const userMessage = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: userEmail }],
      subject: "Schema Analysis Report Received",
      html: `
        <h2>Thank you for your submission!</h2>
        <p>Dear ${userName},</p>
        <p>We have received your schema analysis report (${reportType}) and will review it shortly.</p>
        <p><strong>Your submission details:</strong></p>
        <ul>
          <li><strong>Report Type:</strong> ${reportType}</li>
          <li><strong>Message:</strong> ${message}</li>
        </ul>
        <p>We will contact you at ${userEmail} or ${userPhone} if we need any additional information.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `
    });

    // Send both emails
    $app.newMailClient().send(adminMessage);
    $app.newMailClient().send(userMessage);

    console.log(`Schema analysis report emails sent for record ${recordId}`);
  } catch (error) {
    console.error("Error sending schema analysis report emails:", error);
  }

  e.next();
}, "schema_analysis_reports");
