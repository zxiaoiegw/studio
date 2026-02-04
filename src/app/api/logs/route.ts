import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import IntakeLog from '@/models/IntakeLog';
import Medication from '@/models/Medication';
import { auth } from '@clerk/nextjs/server';

// GET all logs
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const logs = await IntakeLog.find({ userId }).sort({ time: -1 }); // Sort by most recent
    return NextResponse.json(logs.map(toJSON));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST new log (also decrements medication supply when status is 'taken')
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // Reads the request body as JSON (expected shape = IntakeLog data).
    const body = await request.json();
    // Creates and saves the new intake log document.
    const log = await IntakeLog.create({ ...body, userId });

    let updatedMedication = null;
    //If the log references a medication and status is 'taken', then
    if (body.medicationId && body.status === 'taken') {
      // fetch medication by ID
      const medication = await Medication.findOne({ _id: body.medicationId, userId });
      // If found,  — decrement quantity safely (never below 0)
      if (medication) {
        medication.refill.quantity = Math.max(0, medication.refill.quantity - 1);
        // persist change and store it for the response
        await medication.save();
        updatedMedication = medication;
      }
    }

    return NextResponse.json(
      {
        log: toJSON(log),
        ...(updatedMedication && { updatedMedication: toJSON(updatedMedication) }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating log:', error);
    const message = error instanceof Error ? error.message : 'Failed to create log';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}