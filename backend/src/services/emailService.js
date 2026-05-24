const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendBookingConfirmation = async (userEmail, userName, eventName, seats, totalAmount, qrCodeDataURI) => {
    // Extract base64 data from the data URI (remove the "data:image/png;base64," prefix)
    const base64Data = qrCodeDataURI ? qrCodeDataURI.split(',')[1] : null;

    const msg = {
        to: userEmail,
        from: 'eventbooking02@gmail.com', // Keep your verified sender
        subject: `Your Ticket for ${eventName} - EventEase`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6C63FF;">Booking Confirmed!</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Your booking for <strong>${eventName}</strong> is confirmed.</p>
                <div style="background: #f4f4f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Seat Numbers:</strong> ${seats.join(', ')}</p>
                    <p style="margin: 5px 0;"><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
                </div>
                <p><strong>Please present the attached QR Code ticket at the entrance for scanning.</strong></p>
                <p>Enjoy the event!</p>
            </div>
        `,
        attachments: base64Data ? [
            {
                content: base64Data,
                filename: 'ticket-qr-code.png',
                type: 'image/png',
                disposition: 'attachment',
            },
        ] : [],
    };

    try {
        await sgMail.send(msg);
        console.log(`Confirmation email with QR sent to ${userEmail}`);
    } catch (error) {
        console.error('SendGrid Error:', error.response ? error.response.body : error);
    }
};

module.exports = { sendBookingConfirmation };