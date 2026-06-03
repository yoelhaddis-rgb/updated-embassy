import nodemailer from "nodemailer";

// ── Transporter ────────────────────────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    // Real SMTP (configured via env)
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal test account — no config needed, logs preview URL to console
    const testAccount = await nodemailer.createTestAccount();
    console.log("📧 Ethereal test account created:", testAccount.user);
    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return _transporter;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatNlDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? '"Eritrese Ambassade Den Haag" <noreply@eritrean-embassy.nl>';

// ── Email templates ──────────────────────────────────────────────────────────────

function appointmentConfirmationHtml(params: {
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
}) {
  const { firstName, serviceTitle, date, timeSlot, appointmentId, requiredDocs } = params;
  const formattedDate = formatNlDate(date);

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Afspraakbevestiging</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <!-- Eritrean flag line -->
              <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                  <td width="27" height="5" style="background:#2d5fa6;"></td>
                  <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:22px;font-weight:600;margin:0 0 6px;letter-spacing:-0.3px;">
                Afspraak Bevestigd
              </h1>
              <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">
                Eritrese Ambassade – Den Haag
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              <p style="color:#2c2c2c;font-size:16px;margin:0 0 24px;">
                Beste <strong>${firstName}</strong>,
              </p>
              <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 28px;">
                Uw afspraak is succesvol aangemaakt. Hieronder vindt u de details van uw bezoek.
              </p>

              <!-- Details block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ed;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${detailRow("Dienst", serviceTitle)}
                      ${detailRow("Datum", formattedDate)}
                      ${detailRow("Tijdstip", `${timeSlot} uur`)}
                      ${detailRow("Locatie", "Javastraat 58, 2585 AR Den Haag")}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Documents checklist -->
              ${requiredDocs && requiredDocs.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#8a6a00;font-size:13px;margin:0 0 10px;font-weight:600;">📋 Neem mee naar de ambassade:</p>
                    ${requiredDocs.map(doc => `
                    <p style="color:#5a4000;font-size:13px;margin:0 0 5px;padding-left:4px;">☐ ${doc}</p>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                      <strong>⚠️ Belangrijk:</strong> Breng alle originele documenten mee naar uw afspraak.
                      Zonder originele documenten kan uw aanvraag niet worden verwerkt.
                    </p>
                  </td>
                </tr>
              </table>
              `}

              <!-- OV info -->
              <p style="color:#8a8a8a;font-size:13px;line-height:1.7;margin:0 0 8px;">
                <strong style="color:#2c2c2c;">Openbaar vervoer:</strong> Tram 9 – halte Javaplein
              </p>
              <p style="color:#8a8a8a;font-size:13px;line-height:1.7;margin:0 0 32px;">
                <strong style="color:#2c2c2c;">Openingstijden:</strong> Ma – Do 09:00 – 15:00 (alleen op afspraak)
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/mijn-account"
                       style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.2px;">
                      Bekijk mijn afspraken
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #e5dece;">
              <p style="color:#aaa;font-size:12px;margin:0 0 6px;">
                Eritrese Ambassade in Nederland
              </p>
              <p style="color:#aaa;font-size:12px;margin:0 0 6px;">
                Javastraat 58 · 2585 AR Den Haag · +31 70 346 4790
              </p>
              <p style="color:#ccc;font-size:11px;margin:12px 0 0;">
                Afspraakrfn: ${appointmentId.slice(0, 8).toUpperCase()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#8a8a8a;font-size:13px;width:120px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#1a2744;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;
}

function appointmentConfirmationText(params: {
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
}) {
  const { firstName, serviceTitle, date, timeSlot, appointmentId, requiredDocs } = params;
  return `Beste ${firstName},

Uw afspraak bij de Eritrese Ambassade in Den Haag is bevestigd.

AFSPRAAKDETAILS
───────────────
Dienst:   ${serviceTitle}
Datum:    ${formatNlDate(date)}
Tijdstip: ${timeSlot} uur
Locatie:  Javastraat 58, 2585 AR Den Haag

${requiredDocs && requiredDocs.length > 0
  ? `NEEM MEE\n${requiredDocs.map(d => `  ☐ ${d}`).join('\n')}`
  : `BELANGRIJK\nBreng alle originele documenten mee. Zonder originele documenten kan uw aanvraag niet worden verwerkt.`
}

OV: Tram 9 – halte Javaplein
Tel: +31 70 346 4790

Afsprakennummer: ${appointmentId.slice(0, 8).toUpperCase()}

Met vriendelijke groet,
Eritrese Ambassade Den Haag`;
}

// ── Public API ───────────────────────────────────────────────────────────────────

export async function sendTaxReminder(params: {
  to: string;
  firstName: string;
  lastPaidYear: number;
  nextYear: number;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();

    const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>2% Belasting Herinnering</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">2% Rehabilitatiebelasting – Herinnering</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="color:#2c2c2c;font-size:16px;margin:0 0 20px;">Beste <strong>${params.firstName}</strong>,</p>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Uw 2% rehabilitatiebelasting is geregistreerd t/m <strong>${params.lastPaidYear}</strong>.
              Het jaar <strong>${params.nextYear}</strong> nadert — mocht u van plan zijn uw bijdrage te voldoen,
              dan kunt u een afspraak maken bij de ambassade.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:28px;">
              <tr><td style="padding:16px 20px;">
                <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                  <strong>Let op:</strong> Betaling is vrijwillig. U ontvangt deze herinnering omdat u eerder
                  een bijdrage heeft geregistreerd bij de ambassade.
                </p>
              </td></tr>
            </table>
            <p style="color:#8a8a8a;font-size:13px;margin:0 0 28px;line-height:1.7;">
              U kunt ook vooruitbetalen voor meerdere jaren tegelijk.
              Neem contact op of maak een afspraak via onze website.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/afspraken"
                   style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Afspraak maken
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag · +31 70 346 4790</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Herinnering: 2% rehabilitatiebelasting ${params.nextYear}`,
      html,
      text: `Beste ${params.firstName},\n\nUw 2% rehabilitatiebelasting is geregistreerd t/m ${params.lastPaidYear}. Het jaar ${params.nextYear} nadert — mocht u van plan zijn uw bijdrage te voldoen, dan kunt u een afspraak maken bij de ambassade.\n\nBetaling is vrijwillig. U ontvangt deze herinnering omdat u eerder een bijdrage heeft geregistreerd.\n\nMet vriendelijke groet,\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Tax reminder preview URL:", previewUrl);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Tax reminder email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendAppointmentReminder(params: {
  to: string;
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();
    const formattedDate = formatNlDate(params.date);

    const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Afspraakherinnering</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">Herinnering: Afspraak Morgen</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="color:#2c2c2c;font-size:16px;margin:0 0 20px;">Beste <strong>${params.firstName}</strong>,</p>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 24px;">
              Dit is een herinnering dat u morgen een afspraak heeft bij de Eritrese Ambassade in Den Haag.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ed;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="padding:24px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${detailRow("Dienst", params.serviceTitle)}
                  ${detailRow("Datum", formattedDate)}
                  ${detailRow("Tijdstip", `${params.timeSlot} uur`)}
                  ${detailRow("Locatie", "Javastraat 58, 2585 AR Den Haag")}
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:28px;">
              <tr><td style="padding:16px 20px;">
                <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                  <strong>📋 Vergeet niet:</strong> Breng alle originele documenten mee.
                  Kom op tijd – bij meer dan 10 minuten vertraging vervalt uw tijdslot.
                </p>
              </td></tr>
            </table>
            <p style="color:#8a8a8a;font-size:13px;margin:0 0 8px;">
              <strong style="color:#2c2c2c;">Openbaar vervoer:</strong> Tram 9 – halte Javaplein
            </p>
            <p style="color:#8a8a8a;font-size:13px;margin:0 0 28px;">
              <strong style="color:#2c2c2c;">Telefoon:</strong> +31 70 346 4790
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/mijn-account"
                   style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Bekijk afspraakdetails
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0 0 4px;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag</p>
            <p style="color:#ccc;font-size:11px;margin:0;">Afsprakennummer: ${params.appointmentId.slice(0, 8).toUpperCase()}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Herinnering: Afspraak morgen – ${params.serviceTitle} om ${params.timeSlot} uur`,
      html,
      text: `Beste ${params.firstName},\n\nHerinnering: u heeft morgen een afspraak bij de Eritrese Ambassade.\n\nDienst: ${params.serviceTitle}\nDatum: ${formattedDate}\nTijdstip: ${params.timeSlot} uur\nLocatie: Javastraat 58, 2585 AR Den Haag\n\nVergeet uw originele documenten niet mee te nemen.\n\nMet vriendelijke groet,\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Reminder email preview URL:", previewUrl);
    console.log(`✅ Herinneringsmail verstuurd naar ${params.to}`);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Reminder email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendCancellationConfirmation(params: {
  to: string;
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();
    const formattedDate = formatNlDate(params.date);

    const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Afspraak geannuleerd</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">Afspraak Geannuleerd</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="color:#2c2c2c;font-size:16px;margin:0 0 20px;">Beste <strong>${params.firstName}</strong>,</p>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 24px;">
              Uw afspraak is succesvol geannuleerd. U kunt altijd een nieuwe afspraak inplannen via onze website.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ed;border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:4px 0;color:#8a8a8a;font-size:13px;width:120px;">Dienst</td>
                    <td style="padding:4px 0;color:#c0392b;font-size:13px;font-weight:600;text-decoration:line-through;">${params.serviceTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#8a8a8a;font-size:13px;">Datum</td>
                    <td style="padding:4px 0;color:#1a2744;font-size:13px;text-decoration:line-through;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#8a8a8a;font-size:13px;">Tijdstip</td>
                    <td style="padding:4px 0;color:#1a2744;font-size:13px;text-decoration:line-through;">${params.timeSlot} uur</td>
                  </tr>
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/afspraken"
                   style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Nieuwe afspraak maken
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Afspraak geannuleerd – ${params.serviceTitle} · ${formattedDate}`,
      html,
      text: `Beste ${params.firstName},\n\nUw afspraak voor ${params.serviceTitle} op ${formattedDate} om ${params.timeSlot} uur is geannuleerd.\n\nMaak een nieuwe afspraak via https://eritrean-embassy.nl/afspraken\n\nMet vriendelijke groet,\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Cancel email preview URL:", previewUrl);
    console.log(`✅ Annuleringsmail verstuurd naar ${params.to}`);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Cancel email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendContactMessage(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();
    const to = process.env.CONTACT_EMAIL ?? "info@eritrean-embassy.nl";

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      replyTo: `"${params.name}" <${params.email}>`,
      subject: `Contactformulier: ${params.subject} — ${params.name}`,
      html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Contactbericht</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">Nieuw contactbericht</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ed;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${detailRow("Naam", params.name)}
                  ${detailRow("E-mail", params.email)}
                  ${detailRow("Onderwerp", params.subject)}
                </table>
              </td></tr>
            </table>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0;">${params.message}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      text: `Nieuw contactbericht\n\nNaam: ${params.name}\nE-mail: ${params.email}\nOnderwerp: ${params.subject}\n\n${params.message}`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Contact email preview URL:", previewUrl);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Contact email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendDocumentReadyNotification(params: {
  to: string;
  firstName: string;
  originalName: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Uw document is klaar voor ophaling`,
      html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Document klaar</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">Document klaar voor ophaling</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="color:#2c2c2c;font-size:16px;margin:0 0 20px;">Beste <strong>${params.firstName}</strong>,</p>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 24px;">
              Wij zijn blij u te informeren dat uw document klaar is voor ophaling bij de ambassade.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ed;border-radius:12px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${detailRow("Document", params.originalName)}
                  ${detailRow("Locatie", "Javastraat 58, 2585 AR Den Haag")}
                  ${detailRow("Openingstijden", "Ma – Do 09:00 – 15:00")}
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:28px;">
              <tr><td style="padding:16px 20px;">
                <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                  <strong>Let op:</strong> Neem een geldig identiteitsbewijs mee bij het ophalen van uw document.
                </p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/mijn-account"
                   style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Mijn account bekijken
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag · +31 70 346 4790</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      text: `Beste ${params.firstName},\n\nUw document "${params.originalName}" is klaar voor ophaling bij de ambassade.\n\nLocatie: Javastraat 58, 2585 AR Den Haag\nOpeningstijden: Ma – Do 09:00 – 15:00\n\nNeem een geldig identiteitsbewijs mee.\n\nMet vriendelijke groet,\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Document ready email preview URL:", previewUrl);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Document ready email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  firstName: string;
  resetUrl: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Wachtwoord opnieuw instellen – Eritrese Ambassade`,
      html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Wachtwoord opnieuw instellen</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 6px;">Wachtwoord opnieuw instellen</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">Eritrese Ambassade – Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px;">
            <p style="color:#2c2c2c;font-size:16px;margin:0 0 20px;">Beste <strong>${params.firstName}</strong>,</p>
            <p style="color:#5a5a5a;font-size:14px;line-height:1.7;margin:0 0 24px;">
              U heeft een verzoek ingediend om uw wachtwoord opnieuw in te stellen.
              Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
              Deze link is <strong>1 uur</strong> geldig.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td align="center">
                <a href="${params.resetUrl}"
                   style="display:inline-block;background:#c0392b;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  Wachtwoord instellen
                </a>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:16px;">
              <tr><td style="padding:16px 20px;">
                <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                  <strong>Niet aangevraagd?</strong> Negeer dan deze e-mail. Uw wachtwoord blijft ongewijzigd.
                </p>
              </td></tr>
            </table>
            <p style="color:#aaa;font-size:12px;margin:0;word-break:break-all;">
              Of kopieer deze link: ${params.resetUrl}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      text: `Beste ${params.firstName},\n\nU heeft een verzoek ingediend om uw wachtwoord opnieuw in te stellen.\n\nKlik op de volgende link om een nieuw wachtwoord in te stellen (geldig 1 uur):\n${params.resetUrl}\n\nNiet aangevraagd? Negeer dan deze e-mail.\n\nMet vriendelijke groet,\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Password reset email preview URL:", previewUrl);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Password reset email fout:", message);
    return { success: false, error: message };
  }
}

export async function sendAppointmentConfirmation(params: {
  to: string;
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Afspraak bevestigd – ${params.serviceTitle} · ${formatNlDate(params.date)}`,
      text: appointmentConfirmationText(params),
      html: appointmentConfirmationHtml(params),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📧 Email preview URL:", previewUrl);
    }

    console.log(`✅ Bevestigingsmail verstuurd naar ${params.to} (messageId: ${info.messageId})`);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Email fout:", message);
    return { success: false, error: message };
  }
}
