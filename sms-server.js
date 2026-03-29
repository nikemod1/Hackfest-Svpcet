const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

// Minimal .env loader so the server works without extra setup libraries.
function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.SMS_PORT || 3001);

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';
const TEXTBELT_KEY = process.env.TEXTBELT_KEY || 'textbelt';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return null;
  }
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

async function sendViaTextbelt(to, body) {
  const form = new URLSearchParams({
    phone: String(to),
    message: String(body),
    key: TEXTBELT_KEY
  });

  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: form.toString()
  });
  const data = await res.json();
  return {
    ok: Boolean(data && data.success),
    sid: data?.textId || '',
    error: data && !data.success ? (data.error || 'Textbelt rejected request') : ''
  };
}

async function sendViaFast2Sms(to, body) {
  const payload = {
    route: 'q',
    message: String(body),
    language: 'english',
    flash: 0,
    numbers: String(to).replace(/[^\d]/g, '')
  };

  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': FAST2SMS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const ok = Boolean(data && (data.return === true || data.return === 'true'));
  return {
    ok,
    sid: data?.request_id || '',
    error: ok ? '' : (data?.message?.join?.(', ') || data?.message || 'Fast2SMS rejected request')
  };
}

async function sendSmsWithBestAvailableProvider(to, body) {
  if (FAST2SMS_API_KEY) {
    const fast2sms = await sendViaFast2Sms(to, body);
    return {
      ok: fast2sms.ok,
      sid: fast2sms.sid,
      error: fast2sms.error,
      provider: 'fast2sms'
    };
  }

  const twilioClient = getTwilioClient();
  if (twilioClient) {
    const msg = await twilioClient.messages.create({
      body: String(body),
      from: TWILIO_FROM_NUMBER,
      to: String(to)
    });
    return { ok: true, sid: msg.sid, provider: 'twilio' };
  }

  return {
    ok: false,
    sid: '',
    error: 'No SMS provider configured. Set FAST2SMS_API_KEY or Twilio env values.',
    provider: 'none'
  };
}

function getActiveProvider() {
  if (FAST2SMS_API_KEY) return 'fast2sms';
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) return 'twilio';
  return 'none';
}

app.get('/health', (_req, res) => {
  const configured = Boolean(
    FAST2SMS_API_KEY ||
    (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER)
  );
  res.json({
    ok: true,
    configured,
    provider: getActiveProvider(),
    missing: {
      TWILIO_ACCOUNT_SID: !TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER: !TWILIO_FROM_NUMBER,
      FAST2SMS_API_KEY: !FAST2SMS_API_KEY
    }
  });
});

app.post('/api/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body || {};

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    const result = await sendSmsWithBestAvailableProvider(phone, message);
    if (!result.ok) {
      return res.status(500).json({ success: false, error: result.error || 'SMS send failed', provider: result.provider || 'unknown' });
    }
    return res.json({ success: true, sid: result.sid, provider: result.provider });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'SMS send failed' });
  }
});

app.post('/api/send-sos-bulk', async (req, res) => {
  try {
    const { contacts, message } = req.body || {};

    if (!Array.isArray(contacts) || !message) {
      return res.status(400).json({ success: false, error: 'contacts array and message are required' });
    }

    const results = [];
    for (const c of contacts) {
      const phone = String(c?.phone || '').trim();
      const name = String(c?.name || 'CONTACT');
      const relation = String(c?.relation || 'CUSTOM');

      if (!phone) {
        results.push({ ok: false, phone, name, relation, error: 'Missing phone' });
        continue;
      }

      try {
        const sendResult = await sendSmsWithBestAvailableProvider(phone, message);
        results.push({
          ok: sendResult.ok,
          phone,
          name,
          relation,
          sid: sendResult.sid || '',
          provider: sendResult.provider || 'unknown',
          error: sendResult.ok ? '' : (sendResult.error || 'SMS send failed')
        });
      } catch (err) {
        results.push({ ok: false, phone, name, relation, error: err.message || 'SMS send failed' });
      }
    }

    const sentCount = results.filter(r => r.ok).length;
    const responseBody = {
      success: sentCount > 0,
      sentCount,
      total: results.length,
      allFailed: sentCount === 0,
      results
    };

    // Return 200 with per-contact status so clients can render actionable UI
    // without treating provider/configuration issues as transport failures.
    return res.json(responseBody);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Bulk SMS failed' });
  }
});

app.listen(PORT, () => {
  console.log(`SMS server running on http://localhost:${PORT}`);
});
