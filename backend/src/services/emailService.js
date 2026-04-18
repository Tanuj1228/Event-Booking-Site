const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendBookingConfirmation = async (userEmail, userName, eventName, seats, totalAmount) => {
    const msg = {
        to: userEmail,
        from: 'eventbooking02@gmail.com', // Updated to match your verified SendGrid sender
        subject: `Booking Confirmation: ${eventName} - EventEase`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6C63FF;">Booking Confirmed!</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Your booking for <strong>${eventName}</strong> has been successfully processed.</p>
                <div style="background: #f4f4f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Seat Numbers:</strong> ${seats.join(', ')}</p>
                    <p style="margin: 5px 0;"><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
                </div>
                <p>Please show this email at the venue.</p>
                <p>Enjoy the event!</p>
                <p style="font-size: 0.8rem; color: #888;">- The EventEase Team</p>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('SendGrid Error:', error.response ? error.response.body : error);
    }
};

module.exports = { sendBookingConfirmation };