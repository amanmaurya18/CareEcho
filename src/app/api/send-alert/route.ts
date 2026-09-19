import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      patientName = 'Margaret Vance',
      missedMedication = 'Metformin 500mg',
      timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      caregiverContact = '+1 (555) 234-8901',
      type = 'MISSED_DOSE',
      channel = 'WHATSAPP',
      customMessage,
    } = body;

    // Simulate Twilio / WhatsApp Business API payload
    const simulatedDeliveryId = `msg_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    let messageBody = customMessage;
    if (!messageBody) {
      if (type === 'SOS') {
        messageBody = `🚨 EMERGENCY ALERT: ${patientName} triggered SOS at ${timestamp}. Please check in immediately!`;
      } else if (type === 'MISSED_DOSE') {
        messageBody = `⚠️ CareEcho Notification: ${patientName} has not confirmed taking ${missedMedication}. Scheduled at ${timestamp}.`;
      } else {
        messageBody = `✅ CareEcho Update: ${patientName} is doing well and completed routine check-in at ${timestamp}.`;
      }
    }

    console.log(`[CareEcho Alert Dispatch] Channel: ${channel} | To: ${caregiverContact} | Type: ${type}`);
    console.log(`[Message Body]: "${messageBody}"`);

    return NextResponse.json({
      success: true,
      deliveryId: simulatedDeliveryId,
      channel,
      recipient: caregiverContact,
      status: 'DELIVERED',
      timestamp,
      message: `Simulated ${channel} notification successfully dispatched to ${caregiverContact}.`,
      preview: messageBody,
    });
  } catch (err) {
    console.error('Alert dispatch error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to dispatch alert' },
      { status: 500 }
    );
  }
}
