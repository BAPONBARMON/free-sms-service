const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

const app = express();

// ✅ CORS enabled so frontend can make API requests
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Load Twilio credentials securely from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// ✅ Ensure Twilio credentials are available
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("❌ Twilio credentials missing! Set them in Render.com environment variables.");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// ✅ API endpoint to send SMS
app.post('/send-sms', async (req, res) => {
  try {
    const { phone, message, countryCode } = req.body;

    // ✅ Validate input
    if (!phone || !message || !countryCode) {
      return res.status(400).json({ success: false, error: "Missing required fields (phone, message, countryCode)." });
    }

    const fullNumber = `+${countryCode}${phone}`;

    // ✅ Send SMS via Twilio
    const smsResponse = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: fullNumber
    });

    console.log("✅ SMS Sent:", smsResponse.sid);
    res.json({ success: true, sid: smsResponse.sid, message: "SMS sent successfully!" });

  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Set correct PORT for Render.com
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));