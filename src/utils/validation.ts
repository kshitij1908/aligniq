// ============================================================
// Validation Utilities
// ============================================================
import { GoalFormData, Goal, ThrustArea, UoMType } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

const THRUST_AREAS: ThrustArea[] = ['Sales', 'Operations', 'HR', 'Marketing', 'IT', 'Other'];
const UOM_TYPES: UoMType[] = ['MIN', 'MAX', 'TIMELINE', 'ZERO'];

/**
 * Validate a single goal form
 */
export function validateGoalForm(data: GoalFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Goal title is required' });
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be 100 characters or less' });
  }

  // Description
  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Goal description is required' });
  } else if (data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
  }

  // Thrust Area
  if (!data.thrustArea || !THRUST_AREAS.includes(data.thrustArea)) {
    errors.push({ field: 'thrustArea', message: 'Please select a valid thrust area' });
  }

  // UoM Type
  if (!data.uomType || !UOM_TYPES.includes(data.uomType)) {
    errors.push({ field: 'uomType', message: 'Please select a unit of measurement type' });
  }

  // Target Value
  if (data.targetValue === undefined || data.targetValue === null) {
    errors.push({ field: 'targetValue', message: 'Target value is required' });
  } else if (data.targetValue <= 0) {
    errors.push({ field: 'targetValue', message: 'Target value must be a positive number' });
  }

  // Weightage
  if (data.weightage === undefined || data.weightage === null) {
    errors.push({ field: 'weightage', message: 'Weightage is required' });
  } else if (data.weightage < 10) {
    errors.push({ field: 'weightage', message: 'Each goal must have at least 10% weightage' });
  } else if (data.weightage > 100) {
    errors.push({ field: 'weightage', message: 'Weightage cannot exceed 100%' });
  }

  return errors;
}

/**
 * Validate total weightage across all goals
 */
export function validateTotalWeightage(
  goals: { weightage: number }[],
  currentGoalWeightage?: number,
  excludeGoalId?: string,
  allGoals?: Goal[]
): { isValid: boolean; total: number; message?: string } {
  let total: number;

  if (allGoals && excludeGoalId) {
    total = allGoals
      .filter(g => g.id !== excludeGoalId)
      .reduce((sum, g) => sum + g.weightage, 0);
    total += currentGoalWeightage || 0;
  } else {
    total = goals.reduce((sum, g) => sum + g.weightage, 0);
  }

  if (total > 100) {
    return {
      isValid: false,
      total,
      message: `Total weightage exceeds 100%. Currently: ${total}%`,
    };
  }

  return { isValid: true, total };
}

/**
 * Validate goal count (max 8)
 */
export function validateGoalCount(currentCount: number): {
  isValid: boolean;
  message?: string;
} {
  if (currentCount >= 8) {
    return {
      isValid: false,
      message: 'Maximum 8 goals allowed per employee',
    };
  }
  return { isValid: true };
}

/**
 * Check if a goal can be edited
 */
export function canEditGoal(goal: Goal, userRole: string): boolean {
  if (goal.status === 'LOCKED') {
    return userRole === 'ADMIN';
  }
  if (goal.status === 'DRAFT' || goal.status === 'REJECTED') {
    return true;
  }
  return false;
}

/**
 * Validate check-in achievement based on UoM type
 */
export function validateAchievement(
  uomType: UoMType,
  achievement: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (uomType) {
    case 'MIN':
    case 'MAX':
      if (!Number.isFinite(achievement) || achievement < 0) {
        errors.push({
          field: 'achievement',
          message: 'Achievement must be a non-negative number',
        });
      }
      break;
    case 'TIMELINE':
      if (!Number.isFinite(achievement)) {
        errors.push({
          field: 'achievement',
          message: 'Achievement must be a valid numeric value (days)',
        });
      }
      break;
    case 'ZERO':
      if (!Number.isFinite(achievement) || achievement < 0) {
        errors.push({
          field: 'achievement',
          message: 'Achievement must be a non-negative number',
        });
      }
      break;
  }

  return errors;
}
