import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (typeof user === 'object' && 'role' in user) return user as JwtPayload;
    return null;
  } catch {
    return null;
  }
}

function getUserId(user: JwtPayload) {
  return user && (user._id || user.id || user.email || null);
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const db = await getDb();
  const notifications = await db.collection('notifications').find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const db = await getDb();
  const { type, message, quizId } = await req.json();
  if (!type || !message) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  const notification = {
    type,
    message,
    quizId: quizId || null,
    status: 'pending',
    createdAt: new Date(),
    createdBy: getUserId(user),
    approvedBy: null,
    approvedAt: null,
    read: false,
  };
  const result = await db.collection('notifications').insertOne(notification);
  return NextResponse.json({ ...notification, _id: result.insertedId }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  // Find the notification
  const notification = await db.collection('notifications').findOne({ _id: new (require('mongodb').ObjectId)(id) });
  if (!notification) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
  // If approving a quiz assignment, assign the quiz to all users
  if (notification.type === 'quiz-assign' && status === 'approved' && notification.quizId) {
    // Get all user IDs
    const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
    const userIds = users.map((u: any) => u._id);
    // Update the quiz document
    await db.collection('quizzes').updateOne(
      { _id: new (require('mongodb').ObjectId)(notification.quizId) },
      { $addToSet: { assignedTo: { $each: userIds } } }
    );
  }
  const update = {
    status,
    approvedBy: getUserId(user),
    approvedAt: new Date(),
  };
  const result = await db.collection('notifications').updateOne(
    { _id: new (require('mongodb').ObjectId)(id) },
    { $set: update }
  );
  if (result.matchedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Notification updated' });
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const db = await getDb();
  const { id } = await req.json();
  if (!id) {
    // Delete all notifications
    await db.collection('notifications').deleteMany({});
    return NextResponse.json({ message: 'All notifications deleted' });
  }
  const result = await db.collection('notifications').deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
} 