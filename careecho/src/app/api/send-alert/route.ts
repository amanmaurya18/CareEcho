import { NextResponse } from "next/server";

export const runtime = "nodejs";

export interface SendAlertPayload {
  patientName: string;
  missedMedication: string;
  timestamp: string;
  caregiverContact: string;
  type: "MISSED_DOSE" | "SOS";
}

/** In-memory dispatch log (visible in the server console). */
const dispatchLog: (SendAlertPayload & { dispatchedAt: string; messageId: string })[] = [];

function buildMessage(p: SendAlertPayload): string {
  const when = new Date(p.timestamp).toLocaleString();
  if (p.type === "SOS") {
    return `🚨 CareEcho SOS — ${p.patientName} pressed the emergency button at ${when}. Please call immediately: this is not a medicine reminder.`;
  }
  return `⏰ CareEcho alert — ${p.patientName} missed a dose: ${p.missedMedication} (scheduled ${when}). Please check in with her.`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as SendAlertPayload | null;
    if (!body || !body.patientName || !body.type) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Expected { patientName, missedMedication, timestamp, caregiverContact, type: 'MISSED_DOSE' | 'SOS' }",
        },
        { status: 400 }
      );
    }

    const messageId = `msg_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const message = buildMessage(body);
    const channel = body.type === "SOS" ? "sms+whatsapp" : "whatsapp";

    const entry = { ...body, dispatchedAt: new Date().toISOString(), messageId };
    dispatchLog.push(entry);
    if (dispatchLog.length > 100) dispatchLog.shift();

    /* -------------------------------------------------------------- */
    /* SIMULATED Twilio / WhatsApp dispatch.                           */
    /* To go live: POST to the Twilio Messages API here using          */
    /* TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM.  */
    /* The app never fails if those keys are absent.                   */
    /* -------------------------------------------------------------- */
    console.log(
      `[send-alert][SIMULATED → ${channel}] to=${body.caregiverContact} id=${messageId}\n  ${message}`
    );

    // small artificial latency so the UI "sending" state is perceptible
    await new Promise((r) => setTimeout(r, 450));

    return NextResponse.json({
      ok: true,
      simulated: !process.env.TWILIO_ACCOUNT_SID,
      messageId,
      channel,
      to: body.caregiverContact,
      message,
      dispatchedAt: entry.dispatchedAt,
      recentDispatches: dispatchLog.length,
    });
  } catch (err) {
    console.error("[send-alert] error:", err);
    return NextResponse.json({ ok: false, error: "Internal error." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    dispatchLog: dispatchLog.slice(-10),
    note: "POST { patientName, missedMedication, timestamp, caregiverContact, type } to dispatch.",
  });
}
