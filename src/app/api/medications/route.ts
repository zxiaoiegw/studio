import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import Medication from '@/models/Medication';
// Server Components, API Routes, Server-side
// Async function 
import { auth } from '@clerk/nextjs/server';

// GET all medications
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const medications = await Medication.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(medications.map(toJSON));
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}

// POST new medication
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const medication = await Medication.create({ ...body, userId });
    return NextResponse.json(toJSON(medication), { status: 201 });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    );
  }
}