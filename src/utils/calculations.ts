// ============================================================
// Calculation Utilities
// ============================================================
import { UoMType } from '../types';

/**
 * Calculate progress score based on UoM type
 */
export function calculateProgressScore(
  uomType: UoMType,
  targetValue: number,
  achievement: number
): number {
  switch (uomType) {
    case 'MIN':
      // Higher is better: Achievement / Target * 100
      if (targetValue <= 0) return 0;
      return Math.round((achievement / targetValue) * 100 * 100) / 100;

    case 'MAX':
      // Lower is better: Target / Achievement * 100
      if (achievement <= 0) return 0;
      return Math.round((targetValue / achievement) * 100 * 100) / 100;

    case 'TIMELINE':
      // Date-based: if achievement date <= target date → 100%, else proportionally less
      // For simplicity, treat as days: target = deadline day number, achievement = actual day number
      if (achievement <= targetValue) return 100;
      const overshoot = achievement - targetValue;
      const penalty = Math.min(overshoot / targetValue, 1) * 100;
      return Math.round((100 - penalty) * 100) / 100;

    case 'ZERO':
      // Zero = 100%, anything else = 0%
      return achievement === 0 ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Get weighted score for a goal
 */
export function getWeightedScore(progressScore: number, weightage: number): number {
  return Math.round((progressScore * weightage) / 100 * 100) / 100;
}

/**
 * Calculate overall score across all goals
 */
export function calculateOverallScore(
  goals: { progressScore: number; weightage: number }[]
): number {
  return goals.reduce((sum, g) => sum + getWeightedScore(g.progressScore, g.weightage), 0);
}

/**
 * Format progress score for display
 */
export function formatScore(score: number): string {
  if (score >= 100) return `${score.toFixed(1)}%`;
  if (score >= 75) return `${score.toFixed(1)}%`;
  return `${score.toFixed(1)}%`;
}

/**
 * Get score color class based on progress
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-warning)';
  if (score >= 50) return 'var(--color-info)';
  return 'var(--color-danger)';
}
