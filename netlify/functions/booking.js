const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    // Parse form data
    const params = new URLSearchParams(event.body);
    const data = {
      name: params.get('name'),
      company: params.get('company'),
      email: params.get('email'),
      phone: params.get('phone'),
      website: params.get('website'),
      date: params.get('date'),
      time: params.get('time'),
      notes: params.get('notes'),
      timestamp: new Date().toISOString()
    };

    console.log('📨 Booking received:', data);

    // Save to local JSON file (for persistence)
    const bookingsFile = path.join(__dirname, '../../bookings.json');
    let bookings = [];
    
    try {
      if (fs.existsSync(bookingsFile)) {
        const content = fs.readFileSync(bookingsFile, 'utf-8');
        bookings = JSON.parse(content);
      }
    } catch (e) {
      console.log('Creating new bookings file');
    }

    // Add new booking
    bookings.push({
      booking_id: `booking_${Date.now()}`,
      ...data,
      status: 'scheduled',
      reminder_sent: false
    });

    // Save to file
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

    // Send Telegram notification
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.BOOKING_CHAT_ID;

    if (TELEGRAM_TOKEN && CHAT_ID) {
      const bot = new Telegraf(TELEGRAM_TOKEN);

      const message = `🔔 <b>NEUE BUCHUNG BESTÄTIGT</b>

━━━━━━━━━━━━━━━━━━━━━━━━
📞 <b>TERMINDETAILS</b>

<b>Unternehmen:</b> ${data.company}
<b>Kontakt:</b> ${data.name}
<b>Telefon:</b> ${data.phone}
<b>Email:</b> ${data.email}

<b>Datum:</b> ${data.date}
<b>Uhrzeit:</b> ${data.time} CET
<b>Dauer:</b> 30 Minuten

<b>Website:</b> ${data.website || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━
📋 <b>BUCHUNGS-ID:</b> <code>booking_${Date.now()}</code>
⏱️ <b>ZEITSTEMPEL:</b> ${data.timestamp}

⚠️ Pre-Call Intelligence System aktiviert
📊 Intelligenzbericht wird 1 Stunde vor Anruf bereit sein

━━━━━━━━━━━━━━━━━━━━━━━━`;

      try {
        await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' });
        console.log('✅ Telegram notification sent');
      } catch (telegramError) {
        console.error('⚠️ Telegram error:', telegramError);
      }
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        booking_id: `booking_${Date.now()}`,
        message: 'Booking received'
      })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
