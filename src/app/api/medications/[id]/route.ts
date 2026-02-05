import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import Medication from '@/models/Medication';
// Server Components, API Routes, Server-side
// Async function to fetch the medication by ID.
import { auth } from '@clerk/nextjs/server';

// GET single medication
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const medication = await Medication.findOne({ _id: id, userId });
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(toJSON(medication));
  } catch (error) {
    console.error('Error fetching medication:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medication' },
      { status: 500 }
    );
  }
}

// PUT update medication
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId },
      { ...body, userId },
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(toJSON(medication));
  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    );
  }
}

// DELETE medication
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const medication = await Medication.findOneAndDelete({ _id: id, userId });
    
    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    );
  }
}