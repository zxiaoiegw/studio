import { NextResponse } from 'next/server';
import connectDB, { toJSON } from '@/lib/db';
import IntakeLog from '@/models/IntakeLog';
import { auth } from '@clerk/nextjs/server';

// GET single log
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const log = await IntakeLog.findOne({ _id: params.id, userId });
    
    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(toJSON(log));
  } catch (error) {
    console.error('Error fetching log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch log' },
      { status: 500 }
    );
  }
}

// PUT update log
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const log = await IntakeLog.findOneAndUpdate(
      { _id: params.id, userId },
      { ...body, userId },
      { new: true, runValidators: true }
    );
    
    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(toJSON(log));
  } catch (error) {
    console.error('Error updating log:', error);
    return NextResponse.json(
      { error: 'Failed to update log' },
      { status: 500 }
    );
  }
}

// DELETE log
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const log = await IntakeLog.findOneAndDelete({ _id: params.id, userId });
    
    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json(
      { error: 'Failed to delete log' },
      { status: 500 }
    );
  }
}