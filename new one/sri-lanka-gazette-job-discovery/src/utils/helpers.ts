import { Vacancy, UserProfile } from '../types';

export function getDaysRemaining(closingDateStr: string): number {
  // Current local time is 2026-09-17
  const today = new Date('2026-09-17T00:00:00');
  const target = new Date(closingDateStr + 'T23:59:59');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatSalaryRange(min: number, max: number): string {
  return `Rs. ${min.toLocaleString('en-LK')} – ${max.toLocaleString('en-LK')}`;
}

export interface MatchResult {
  isMatch: boolean;
  score: number; // 0 to 100
  reasons: {
    type: 'qualification' | 'age' | 'location' | 'field';
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }[];
}

export function evaluateEligibilityMatch(vacancy: Vacancy, profile: UserProfile | null): MatchResult | null {
  if (!profile) {
    return null;
  }

  const preferredDistricts = Array.isArray(profile.preferredDistricts) ? profile.preferredDistricts : [];

  if (!profile.highestEducation && !profile.age && preferredDistricts.length === 0) {
    return null;
  }

  const reasons: MatchResult['reasons'] = [];
  let score = 50;

  // Check Age
  if (profile.age !== '') {
    const userAge = Number(profile.age);
    if (userAge >= vacancy.ageLimit.min && userAge <= vacancy.ageLimit.max) {
      reasons.push({
        type: 'age',
        status: 'pass',
        message: `Your age (${userAge}) is within the eligible range (${vacancy.ageLimit.min}–${vacancy.ageLimit.max} years).`
      });
      score += 25;
    } else if (userAge < vacancy.ageLimit.min) {
      reasons.push({
        type: 'age',
        status: 'fail',
        message: `Below minimum age limit (${userAge} vs min ${vacancy.ageLimit.min} years).`
      });
      score -= 20;
    } else {
      reasons.push({
        type: 'age',
        status: 'fail',
        message: `Exceeds maximum age limit (${userAge} vs max ${vacancy.ageLimit.max} years).`
      });
      score -= 20;
    }
  }

  // Check Qualification Level hierarchy
  if (profile.highestEducation) {
    const qualRank: Record<string, number> = {
      'OL': 1,
      'AL': 2,
      'Diploma': 3,
      'Higher Diploma': 4,
      'Bachelors': 5,
      'Masters': 6,
      'Professional': 6
    };

    const userRank = qualRank[profile.highestEducation] || 0;
    const reqRank = qualRank[vacancy.qualifications.level] || 0;

    if (userRank >= reqRank) {
      reasons.push({
        type: 'qualification',
        status: 'pass',
        message: `Your qualification level (${profile.highestEducation}) satisfies the minimum required level (${vacancy.qualifications.level}).`
      });
      score += 25;
    } else {
      reasons.push({
        type: 'qualification',
        status: 'fail',
        message: `Requires ${vacancy.qualifications.level} level qualification (You indicated: ${profile.highestEducation}).`
      });
      score -= 25;
    }
  }

  // Check Field match
  if (profile.degreeField) {
    const query = profile.degreeField.toLowerCase();
    const vacField = vacancy.field.toLowerCase();
    const titleMatch = (vacancy.title.en + ' ' + vacancy.qualifications.summary.en).toLowerCase().includes(query);
    if (vacField.includes(query) || titleMatch) {
      reasons.push({
        type: 'field',
        status: 'pass',
        message: `Your field background in ${profile.degreeField} directly aligns with this vacancy.`
      });
      score += 15;
    }
  }

  // Location preference
  if (preferredDistricts.length > 0) {
    const isAllIsland = vacancy.location === 'All Island';
    const hasDistMatch = preferredDistricts.includes(vacancy.location);
    if (isAllIsland || hasDistMatch) {
      reasons.push({
        type: 'location',
        status: 'pass',
        message: isAllIsland ? 'Available Island-wide (All Districts).' : `Stationed in preferred district (${vacancy.location}).`
      });
      score += 10;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    isMatch: score >= 60,
    score,
    reasons
  };
}
