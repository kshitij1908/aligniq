// ============================================================
// Data Store — Acts as the in-memory database
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User, Goal, CheckIn, CheckInComment, AuditLog, Cycle,
  Notification, SharedGoal, GoalStatus, Quarter, CyclePhase,
  GoalFormData, CheckInFormData, UoMType,
} from '../types';
import { generateId } from '../utils/formatters';
import { calculateProgressScore } from '../utils/calculations';

// ---- Seed Data ----

const SEED_USERS: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@atomquest.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'ADMIN',
    department: 'HR',
    managerId: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-mgr-1',
    email: 'rahul.m@atomquest.com',
    firstName: 'Rahul',
    lastName: 'Mehta',
    role: 'MANAGER',
    department: 'Sales',
    managerId: 'user-admin-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-mgr-2',
    email: 'anita.k@atomquest.com',
    firstName: 'Anita',
    lastName: 'Kumar',
    role: 'MANAGER',
    department: 'IT',
    managerId: 'user-admin-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-emp-1',
    email: 'arjun.p@atomquest.com',
    firstName: 'Arjun',
    lastName: 'Patel',
    role: 'EMPLOYEE',
    department: 'Sales',
    managerId: 'user-mgr-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-emp-2',
    email: 'sneha.r@atomquest.com',
    firstName: 'Sneha',
    lastName: 'Reddy',
    role: 'EMPLOYEE',
    department: 'Sales',
    managerId: 'user-mgr-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-emp-3',
    email: 'vikram.s@atomquest.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    role: 'EMPLOYEE',
    department: 'IT',
    managerId: 'user-mgr-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-emp-4',
    email: 'meera.j@atomquest.com',
    firstName: 'Meera',
    lastName: 'Joshi',
    role: 'EMPLOYEE',
    department: 'IT',
    managerId: 'user-mgr-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const now = new Date().toISOString();

const SEED_GOALS: Goal[] = [
  {
    id: 'goal-1',
    employeeId: 'user-emp-1',
    title: 'Increase Q1 Sales Revenue',
    description: 'Achieve quarterly sales revenue target of $150K through new client acquisition and upselling to existing clients.',
    thrustArea: 'Sales',
    uomType: 'MIN',
    targetValue: 150000,
    weightage: 30,
    status: 'LOCKED',
    lockedAt: '2024-05-20T10:00:00Z',
    lockedBy: 'user-mgr-1',
    createdAt: '2024-05-10T09:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'goal-2',
    employeeId: 'user-emp-1',
    title: 'Reduce Customer Acquisition Cost',
    description: 'Lower the average customer acquisition cost from $500 to $350 through optimized digital campaigns.',
    thrustArea: 'Sales',
    uomType: 'MAX',
    targetValue: 350,
    weightage: 25,
    status: 'LOCKED',
    lockedAt: '2024-05-20T10:00:00Z',
    lockedBy: 'user-mgr-1',
    createdAt: '2024-05-10T09:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'goal-3',
    employeeId: 'user-emp-1',
    title: 'Complete CRM Migration',
    description: 'Migrate all customer data from legacy system to new Salesforce CRM by end of Q2.',
    thrustArea: 'IT',
    uomType: 'TIMELINE',
    targetValue: 90,
    weightage: 25,
    status: 'LOCKED',
    lockedAt: '2024-05-20T10:00:00Z',
    lockedBy: 'user-mgr-1',
    createdAt: '2024-05-10T09:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'goal-4',
    employeeId: 'user-emp-1',
    title: 'Zero Data Breaches',
    description: 'Maintain zero security incidents and data breaches throughout the fiscal year.',
    thrustArea: 'IT',
    uomType: 'ZERO',
    targetValue: 0,
    weightage: 20,
    status: 'LOCKED',
    lockedAt: '2024-05-20T10:00:00Z',
    lockedBy: 'user-mgr-1',
    createdAt: '2024-05-10T09:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  // Sneha's goals - submitted, awaiting approval
  {
    id: 'goal-5',
    employeeId: 'user-emp-2',
    title: 'Grow Market Share in West Region',
    description: 'Increase market share in the western region from 12% to 18% through strategic partnerships.',
    thrustArea: 'Sales',
    uomType: 'MIN',
    targetValue: 18,
    weightage: 35,
    status: 'SUBMITTED',
    createdAt: '2024-05-12T09:00:00Z',
    updatedAt: '2024-05-12T09:00:00Z',
  },
  {
    id: 'goal-6',
    employeeId: 'user-emp-2',
    title: 'Improve Lead Conversion Rate',
    description: 'Increase lead-to-customer conversion rate from 15% to 25%.',
    thrustArea: 'Marketing',
    uomType: 'MIN',
    targetValue: 25,
    weightage: 30,
    status: 'SUBMITTED',
    createdAt: '2024-05-12T09:00:00Z',
    updatedAt: '2024-05-12T09:00:00Z',
  },
  {
    id: 'goal-7',
    employeeId: 'user-emp-2',
    title: 'Launch Partner Program',
    description: 'Design and launch a channel partner program with at least 10 partners onboarded.',
    thrustArea: 'Sales',
    uomType: 'MIN',
    targetValue: 10,
    weightage: 35,
    status: 'SUBMITTED',
    createdAt: '2024-05-12T09:00:00Z',
    updatedAt: '2024-05-12T09:00:00Z',
  },
  // Vikram's goals - drafts
  {
    id: 'goal-8',
    employeeId: 'user-emp-3',
    title: 'Reduce System Downtime',
    description: 'Reduce unplanned system downtime from 4 hours/month to under 1 hour/month.',
    thrustArea: 'IT',
    uomType: 'MAX',
    targetValue: 1,
    weightage: 40,
    status: 'DRAFT',
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-14T09:00:00Z',
  },
  {
    id: 'goal-9',
    employeeId: 'user-emp-3',
    title: 'Deploy CI/CD Pipeline',
    description: 'Implement automated CI/CD pipeline for all production services.',
    thrustArea: 'IT',
    uomType: 'TIMELINE',
    targetValue: 60,
    weightage: 30,
    status: 'DRAFT',
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-14T09:00:00Z',
  },
];

const SEED_CHECKINS: CheckIn[] = [
  {
    id: 'ci-1',
    goalId: 'goal-1',
    quarter: 'Q1',
    achievement: 165000,
    status: 'ON_TRACK',
    progressScore: 110,
    submittedBy: 'user-emp-1',
    submittedAt: '2024-07-15T10:00:00Z',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z',
  },
  {
    id: 'ci-2',
    goalId: 'goal-2',
    quarter: 'Q1',
    achievement: 300,
    status: 'ON_TRACK',
    progressScore: 116.67,
    submittedBy: 'user-emp-1',
    submittedAt: '2024-07-15T10:00:00Z',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z',
  },
  {
    id: 'ci-3',
    goalId: 'goal-3',
    quarter: 'Q1',
    achievement: 45,
    status: 'ON_TRACK',
    progressScore: 100,
    submittedBy: 'user-emp-1',
    submittedAt: '2024-07-15T10:00:00Z',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z',
  },
  {
    id: 'ci-4',
    goalId: 'goal-4',
    quarter: 'Q1',
    achievement: 0,
    status: 'COMPLETED',
    progressScore: 100,
    submittedBy: 'user-emp-1',
    submittedAt: '2024-07-15T10:00:00Z',
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-15T10:00:00Z',
  },
];

const SEED_CYCLES: Cycle[] = [
  {
    id: 'cycle-1',
    cycleYear: 2024,
    phase: 'PHASE1',
    startDate: '2024-05-01',
    endDate: '2024-06-30',
    isActive: false,
    createdBy: 'user-admin-1',
    createdAt: '2024-04-15T00:00:00Z',
  },
  {
    id: 'cycle-2',
    cycleYear: 2024,
    phase: 'Q1',
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    isActive: true,
    createdBy: 'user-admin-1',
    createdAt: '2024-04-15T00:00:00Z',
  },
  {
    id: 'cycle-3',
    cycleYear: 2024,
    phase: 'Q2',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    isActive: false,
    createdBy: 'user-admin-1',
    createdAt: '2024-04-15T00:00:00Z',
  },
  {
    id: 'cycle-4',
    cycleYear: 2024,
    phase: 'Q3',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    isActive: false,
    createdBy: 'user-admin-1',
    createdAt: '2024-04-15T00:00:00Z',
  },
  {
    id: 'cycle-5',
    cycleYear: 2024,
    phase: 'Q4',
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    isActive: false,
    createdBy: 'user-admin-1',
    createdAt: '2024-04-15T00:00:00Z',
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    goalId: 'goal-1',
    changedBy: 'user-emp-1',
    changeType: 'goal_created',
    oldValue: '{}',
    newValue: JSON.stringify({ title: 'Increase Q1 Sales Revenue', weightage: 30 }),
    timestamp: '2024-05-10T09:00:00Z',
  },
  {
    id: 'audit-2',
    goalId: 'goal-1',
    changedBy: 'user-emp-1',
    changeType: 'status_changed',
    oldValue: 'DRAFT',
    newValue: 'SUBMITTED',
    timestamp: '2024-05-15T10:00:00Z',
  },
  {
    id: 'audit-3',
    goalId: 'goal-1',
    changedBy: 'user-mgr-1',
    changeType: 'status_changed',
    oldValue: 'SUBMITTED',
    newValue: 'LOCKED',
    reason: 'Goals reviewed and approved',
    timestamp: '2024-05-20T10:00:00Z',
  },
];

// ---- Store Interface ----

interface DataState {
  users: User[];
  goals: Goal[];
  checkIns: CheckIn[];
  checkInComments: CheckInComment[];
  sharedGoals: SharedGoal[];
  auditLogs: AuditLog[];
  cycles: Cycle[];
  notifications: Notification[];

  // User ops
  getUser: (id: string) => User | undefined;
  getUsersByManager: (managerId: string) => User[];
  getAllEmployees: () => User[];

  // Goal ops
  getGoalsByEmployee: (employeeId: string) => Goal[];
  getGoalsByManager: (managerId: string) => Goal[];
  getGoal: (id: string) => Goal | undefined;
  createGoal: (employeeId: string, data: GoalFormData) => Goal;
  updateGoal: (id: string, data: Partial<GoalFormData>, changedBy: string) => Goal;
  deleteGoal: (id: string) => void;
  submitGoal: (id: string, changedBy: string) => Goal;
  submitAllGoals: (employeeId: string, changedBy: string) => Goal[];
  approveGoals: (employeeId: string, managerId: string, comment?: string) => Goal[];
  rejectGoal: (id: string, managerId: string, reason: string) => Goal;
  unlockGoal: (id: string, adminId: string, reason: string) => Goal;

  // Check-in ops
  getCheckInsByGoal: (goalId: string) => CheckIn[];
  getCheckInsByEmployee: (employeeId: string, quarter?: Quarter) => CheckIn[];
  createCheckIn: (data: CheckInFormData, submittedBy: string) => CheckIn;
  getCheckInComments: (checkInId: string) => CheckInComment[];
  addCheckInComment: (checkInId: string, managerId: string, comment: string) => CheckInComment;

  // Cycle ops
  getActiveCycle: () => Cycle | undefined;
  getCycles: () => Cycle[];
  createCycle: (data: Omit<Cycle, 'id' | 'createdAt'>) => Cycle;
  updateCycle: (id: string, data: Partial<Cycle>) => Cycle;

  // Audit ops
  getAuditLogs: (goalId?: string) => AuditLog[];
  createAuditLog: (goalId: string, changedBy: string, changeType: string, oldValue: string, newValue: string, reason?: string) => void;

  // Notification ops
  getNotifications: (userId: string) => Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (userId: string, title: string, message: string, type: Notification['type'], link?: string) => void;

  // Reset
  resetData: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      goals: SEED_GOALS,
      checkIns: SEED_CHECKINS,
      checkInComments: [],
      sharedGoals: [],
      auditLogs: SEED_AUDIT_LOGS,
      cycles: SEED_CYCLES,
      notifications: [],

      // --- User Operations ---
      getUser: (id) => get().users.find(u => u.id === id),
      getUsersByManager: (managerId) => get().users.filter(u => u.managerId === managerId),
      getAllEmployees: () => get().users.filter(u => u.role === 'EMPLOYEE'),

      // --- Goal Operations ---
      getGoalsByEmployee: (employeeId) => get().goals.filter(g => g.employeeId === employeeId),
      getGoalsByManager: (managerId) => {
        const teamIds = get().users.filter(u => u.managerId === managerId).map(u => u.id);
        return get().goals.filter(g => teamIds.includes(g.employeeId));
      },
      getGoal: (id) => get().goals.find(g => g.id === id),

      createGoal: (employeeId, data) => {
        const goal: Goal = {
          id: generateId(),
          employeeId,
          title: data.title,
          description: data.description,
          thrustArea: data.thrustArea,
          uomType: data.uomType,
          targetValue: data.targetValue,
          weightage: data.weightage,
          status: 'DRAFT',
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ goals: [...s.goals, goal] }));
        get().createAuditLog(goal.id, employeeId, 'goal_created', '{}', JSON.stringify({
          title: data.title, weightage: data.weightage, target: data.targetValue,
        }));
        return goal;
      },

      updateGoal: (id, data, changedBy) => {
        let oldGoal: Goal | undefined;
        set(s => ({
          goals: s.goals.map(g => {
            if (g.id === id) {
              oldGoal = { ...g };
              return { ...g, ...data, updatedAt: new Date().toISOString() };
            }
            return g;
          }),
        }));
        if (oldGoal && data.targetValue !== undefined) {
          get().createAuditLog(id, changedBy, 'target_updated', String(oldGoal.targetValue), String(data.targetValue));
        }
        if (oldGoal && data.weightage !== undefined) {
          get().createAuditLog(id, changedBy, 'weightage_updated', String(oldGoal.weightage), String(data.weightage));
        }
        return get().goals.find(g => g.id === id)!;
      },

      deleteGoal: (id) => {
        set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
      },

      submitGoal: (id, changedBy) => {
        set(s => ({
          goals: s.goals.map(g =>
            g.id === id ? { ...g, status: 'SUBMITTED' as GoalStatus, updatedAt: new Date().toISOString() } : g
          ),
        }));
        get().createAuditLog(id, changedBy, 'status_changed', 'DRAFT', 'SUBMITTED');
        return get().goals.find(g => g.id === id)!;
      },

      submitAllGoals: (employeeId, changedBy) => {
        const employeeGoals = get().goals.filter(
          g => g.employeeId === employeeId && (g.status === 'DRAFT' || g.status === 'REJECTED')
        );
        employeeGoals.forEach(g => get().submitGoal(g.id, changedBy));
        // Notify manager
        const employee = get().getUser(employeeId);
        if (employee?.managerId) {
          get().addNotification(
            employee.managerId,
            'Goals Submitted for Approval',
            `${employee.firstName} ${employee.lastName} has submitted ${employeeGoals.length} goals for your review.`,
            'info',
            '/approval'
          );
        }
        return get().goals.filter(g => g.employeeId === employeeId);
      },

      approveGoals: (employeeId, managerId, comment) => {
        const ts = new Date().toISOString();
        set(s => ({
          goals: s.goals.map(g =>
            g.employeeId === employeeId && g.status === 'SUBMITTED'
              ? { ...g, status: 'LOCKED' as GoalStatus, lockedAt: ts, lockedBy: managerId, updatedAt: ts }
              : g
          ),
        }));
        const approved = get().goals.filter(g => g.employeeId === employeeId && g.status === 'LOCKED');
        approved.forEach(g => {
          get().createAuditLog(g.id, managerId, 'status_changed', 'SUBMITTED', 'LOCKED', comment || 'Goals reviewed and approved');
        });
        // Notify employee
        get().addNotification(
          employeeId,
          'Goals Approved ✅',
          'Your goals have been approved and locked by your manager.',
          'success',
          '/goals'
        );
        return approved;
      },

      rejectGoal: (id, managerId, reason) => {
        set(s => ({
          goals: s.goals.map(g =>
            g.id === id
              ? { ...g, status: 'REJECTED' as GoalStatus, rejectionReason: reason, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
        get().createAuditLog(id, managerId, 'status_changed', 'SUBMITTED', 'REJECTED', reason);
        const goal = get().goals.find(g => g.id === id)!;
        get().addNotification(
          goal.employeeId,
          'Goal Rejected ⚠️',
          `Your goal "${goal.title}" needs revision. Reason: ${reason}`,
          'warning',
          '/goals'
        );
        return goal;
      },

      unlockGoal: (id, adminId, reason) => {
        set(s => ({
          goals: s.goals.map(g =>
            g.id === id
              ? { ...g, status: 'DRAFT' as GoalStatus, lockedAt: undefined, lockedBy: undefined, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
        get().createAuditLog(id, adminId, 'goal_unlocked', 'LOCKED', 'DRAFT', reason);
        return get().goals.find(g => g.id === id)!;
      },

      // --- Check-in Operations ---
      getCheckInsByGoal: (goalId) => get().checkIns.filter(ci => ci.goalId === goalId),
      getCheckInsByEmployee: (employeeId, quarter) => {
        const goalIds = get().goals.filter(g => g.employeeId === employeeId).map(g => g.id);
        return get().checkIns.filter(ci =>
          goalIds.includes(ci.goalId) && (!quarter || ci.quarter === quarter)
        );
      },

      createCheckIn: (data, submittedBy) => {
        const goal = get().goals.find(g => g.id === data.goalId);
        if (!goal) throw new Error('Goal not found');

        const progressScore = calculateProgressScore(goal.uomType, goal.targetValue, data.achievement);
        const ts = new Date().toISOString();
        const checkIn: CheckIn = {
          id: generateId(),
          goalId: data.goalId,
          quarter: data.quarter,
          achievement: data.achievement,
          status: data.status,
          progressScore,
          submittedBy,
          submittedAt: ts,
          createdAt: ts,
          updatedAt: ts,
        };
        set(s => ({ checkIns: [...s.checkIns, checkIn] }));
        get().createAuditLog(data.goalId, submittedBy, 'checkin_submitted', '{}', JSON.stringify({
          quarter: data.quarter, achievement: data.achievement, progressScore,
        }));
        return checkIn;
      },

      getCheckInComments: (checkInId) => get().checkInComments.filter(c => c.checkInId === checkInId),

      addCheckInComment: (checkInId, managerId, comment) => {
        const entry: CheckInComment = {
          id: generateId(),
          checkInId,
          managerId,
          comment,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ checkInComments: [...s.checkInComments, entry] }));
        return entry;
      },

      // --- Cycle Operations ---
      getActiveCycle: () => get().cycles.find(c => c.isActive),
      getCycles: () => get().cycles,

      createCycle: (data) => {
        const cycle: Cycle = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({ cycles: [...s.cycles, cycle] }));
        return cycle;
      },

      updateCycle: (id, data) => {
        set(s => ({
          cycles: s.cycles.map(c => (c.id === id ? { ...c, ...data } : c)),
        }));
        return get().cycles.find(c => c.id === id)!;
      },

      // --- Audit Log Operations ---
      getAuditLogs: (goalId) => {
        if (goalId) return get().auditLogs.filter(a => a.goalId === goalId);
        return get().auditLogs;
      },

      createAuditLog: (goalId, changedBy, changeType, oldValue, newValue, reason) => {
        const entry: AuditLog = {
          id: generateId(),
          goalId,
          changedBy,
          changeType,
          oldValue,
          newValue,
          reason,
          timestamp: new Date().toISOString(),
        };
        set(s => ({ auditLogs: [...s.auditLogs, entry] }));
      },

      // --- Notification Operations ---
      getNotifications: (userId) => get().notifications.filter(n => n.userId === userId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),

      markNotificationRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      addNotification: (userId, title, message, type, link) => {
        const notif: Notification = {
          id: generateId(),
          userId,
          title,
          message,
          type,
          read: false,
          link,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ notifications: [...s.notifications, notif] }));
      },

      // Reset
      resetData: () => {
        set({
          users: SEED_USERS,
          goals: SEED_GOALS,
          checkIns: SEED_CHECKINS,
          checkInComments: [],
          sharedGoals: [],
          auditLogs: SEED_AUDIT_LOGS,
          cycles: SEED_CYCLES,
          notifications: [],
        });
      },
    }),
    {
      name: 'atomquest-data',
    }
  )
);
