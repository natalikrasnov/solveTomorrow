import fs from 'fs';
import path from 'path';
import { IdeaSession } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sessions.json');
const CREDITS_FILE = path.join(DATA_DIR, 'credits.json');

export interface UserCreditRecord {
  userId: string;
  additionalGenerations: number;
  totalPaid: number;
  totalCommission: number;
}

// Ensure data folder and DB file exist
export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(CREDITS_FILE)) {
    fs.writeFileSync(CREDITS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Read sessions
export function readSessions(): IdeaSession[] {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as IdeaSession[];
  } catch (error) {
    console.error('Failed to read database:', error);
    return [];
  }
}

// Write sessions
export function writeSessions(sessions: IdeaSession[]) {
  try {
    initDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database:', error);
  }
}

// Read Credit Records
export function readCredits(): UserCreditRecord[] {
  try {
    initDb();
    const data = fs.readFileSync(CREDITS_FILE, 'utf-8');
    return JSON.parse(data) as UserCreditRecord[];
  } catch (error) {
    console.error('Failed to read credits database:', error);
    return [];
  }
}

// Write Credit Records
export function writeCredits(records: UserCreditRecord[]) {
  try {
    initDb();
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write credits database:', error);
  }
}

// Get credits details for a user
export function getUserCredits(userId: string): UserCreditRecord {
  const records = readCredits();
  const found = records.find(r => r.userId === userId);
  if (found) {
    return found;
  }
  return {
    userId,
    additionalGenerations: 0,
    totalPaid: 0,
    totalCommission: 0
  };
}

// Add bought credits
export function addCreditsForUser(userId: string, amount: number, additionalCount: number): UserCreditRecord {
  const records = readCredits();
  const index = records.findIndex(r => r.userId === userId);
  
  // Commission model: $1 commission per $5 paid (which is exactly 20% of the total amount spent).
  // Hidden commission from owner config.
  const commission = amount * 0.20;

  let record: UserCreditRecord;
  if (index !== -1) {
    record = records[index];
    record.additionalGenerations += additionalCount;
    record.totalPaid += amount;
    record.totalCommission += commission;
    records[index] = record;
  } else {
    record = {
      userId,
      additionalGenerations: additionalCount,
      totalPaid: amount,
      totalCommission: commission
    };
    records.push(record);
  }
  
  writeCredits(records);
  return record;
}

// Get session by ID
export function getSessionById(id: string): IdeaSession | undefined {
  const sessions = readSessions();
  return sessions.find(s => s._id === id);
}

// Save or update session
export function saveSession(session: IdeaSession) {
  const sessions = readSessions();
  const index = sessions.findIndex(s => s._id === session._id);
  if (index !== -1) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  writeSessions(sessions);
}

// Delete session
export function deleteSession(id: string): boolean {
  const sessions = readSessions();
  const originalLength = sessions.length;
  const filtered = sessions.filter(s => s._id !== id);
  if (filtered.length < originalLength) {
    writeSessions(filtered);
    return true;
  }
  return false;
}
