import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import Medication from '@/models/Medication';
import IntakeLog from '@/models/IntakeLog';
import { auth } from '@clerk/nextjs/server';

// GET notifications: refill reminders + missed doses
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Refill reminders: medications where supply <= reminderThreshold
    const medications = await Medication.find({ userId });
    const refillReminders = medications.filter(
      (m) => m.refill.quantity <= m.refill.reminderThreshold
    );

    // Missed doses: intake logs with status 'missed' (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const missedDoses = await IntakeLog.find({
      userId,
      status: 'missed',
      time: { $gte: thirtyDaysAgo },
    })
      .sort({ time: -1 })
      .limit(50);

    return NextResponse.json({
      refillReminders: refillReminders.map(toJSON),
      missedDoses: missedDoses.map(toJSON),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
