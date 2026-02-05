import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import Medication from '@/models/Medication';
import IntakeLog from '@/models/IntakeLog';
import { auth } from '@clerk/nextjs/server';

interface ScheduledDose {
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  time: Date;
}

interface MissedDose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: Date;
}

// Calculate scheduled dose times for a medication within a date range
function calculateScheduledDoses(
  medication: any,
  startDate: Date,
  endDate: Date
): ScheduledDose[] {
  const doses: ScheduledDose[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();

    // Check if medication is scheduled for this day
    let isScheduled = false;

    if (medication.schedule.frequency === 'daily') {
      isScheduled = true;
    } else if (medication.schedule.frequency === 'weekly' || medication.schedule.frequency === 'custom') {
      isScheduled = medication.schedule.days?.includes(dayOfWeek) ?? false;
    }

    // Add dose for each scheduled time
    if (isScheduled) {
      for (const time of medication.schedule.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const doseDate = new Date(current);
        doseDate.setHours(hours, minutes, 0, 0);

        doses.push({
          medicationId: medication._id.toString(),
          medicationName: medication.name,
          dosage: medication.dosage,
          scheduledTime: time,
          time: doseDate,
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return doses;
}

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

    // Missed doses: auto-detect from schedule vs intake logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Calculate all scheduled doses for the last 7 days
    const allScheduledDoses = medications.flatMap((med) =>
      calculateScheduledDoses(med, sevenDaysAgo, today)
    );

    // Get all intake logs in the same period
    const intakeLogs = await IntakeLog.find({
      userId,
      time: { $gte: sevenDaysAgo, $lte: today },
      status: 'taken',
    });

    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Find missed doses: scheduled but not taken
    const takenSet = new Set<string>();
    for (const log of intakeLogs) {
      // Create a key: medicationId + date (YYYY-MM-DD) + hour using local timezone
      const logDate = new Date(log.time);
      const dateKey = formatLocalDate(logDate);
      const hour = String(logDate.getHours()).padStart(2, '0');
      const key = `${log.medicationId}|${dateKey}|${hour}`;
      takenSet.add(key);
    }

    const missedDoses: MissedDose[] = allScheduledDoses
      .filter((dose) => {
        // Check if dose was already taken using local date for consistency
        const dateKey = formatLocalDate(dose.time);
        const [hour] = dose.scheduledTime.split(':');
        const key = `${dose.medicationId}|${dateKey}|${hour}`;

        if (takenSet.has(key)) {
          return false;
        }

        // For today's doses, only mark as missed if the scheduled time has passed
        // Use local date comparison to properly determine if it's today
        const now = new Date();
        const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const doseLocal = new Date(dose.time.getFullYear(), dose.time.getMonth(), dose.time.getDate());

        if (todayLocal.getTime() === doseLocal.getTime()) {
          // It's today - only mark as missed if the scheduled time has passed
          const [scheduledHour, scheduledMinute] = dose.scheduledTime.split(':').map(Number);
          const nowHours = now.getHours();
          const nowMinutes = now.getMinutes();

          // Create a comparable time value (HHMM)
          const scheduledTimeValue = scheduledHour * 100 + scheduledMinute;
          const nowTimeValue = nowHours * 100 + nowMinutes;

          // Only count as missed if scheduled time is in the past
          if (nowTimeValue < scheduledTimeValue) {
            return false;
          }
        }

        return true;
      })
      .map((dose) => ({
        id: `${dose.medicationId}|${formatLocalDate(dose.time)}|${dose.scheduledTime}`,
        medicationId: dose.medicationId,
        medicationName: dose.medicationName,
        dosage: dose.dosage,
        time: dose.time,
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 50); // Limit to 50 most recent

    return NextResponse.json({
      refillReminders: refillReminders.map(toJSON),
      missedDoses,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
