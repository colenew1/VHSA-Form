/**
 * Screening Requirements Logic
 * Determines which screenings are required based on grade, gender, status, and DOB
 */

/**
 * Calculate required screenings for a student
 * @param {string} grade - Student's grade (e.g., "Pre-K (3)", "Kindergarten", "1st grade")
 * @param {string} gender - Student's gender ("male", "female", "other")
 * @param {string} status - Student's status ("new", "returning")
 * @param {string} dob - Date of birth (YYYY-MM-DD format)
 * @returns {Object} Object containing required screenings
 */
function calculateRequiredScreenings(grade, gender, status, dob) {
  const requiredScreenings = {
    vision: false,
    hearing: false,
    acanthosis: false,
    scoliosis: false
  };

  // Parse grade to extract numeric value
  const gradeNumber = extractGradeNumber(grade);
  const isNewStudent = status === 'new';
  const isFemale = gender === 'female';
  const isOther = gender === 'other';

  // Pre-K (3): Not required for state reporting
  if (grade === 'Pre-K (3)') {
    return requiredScreenings;
  }

  // Pre-K (4): Required only if DOB before Sept 1 (age 4 cutoff)
  if (grade === 'Pre-K (4)') {
    if (isBornBeforeCutoff(dob, 4)) {
      requiredScreenings.vision = true;
      requiredScreenings.hearing = true;
    }
    return requiredScreenings;
  }

  // Kindergarten: Vision + Hearing
  if (gradeNumber === 0) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    return requiredScreenings;
  }

  // 1st grade: Vision + Hearing + Acanthosis
  if (gradeNumber === 1) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  // 2nd grade NEW students: Vision + Hearing + Acanthosis
  if (gradeNumber === 2 && isNewStudent) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  // 3rd grade: Vision + Hearing + Acanthosis
  if (gradeNumber === 3) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  // 4th grade NEW students: Vision + Hearing + Acanthosis
  if (gradeNumber === 4 && isNewStudent) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  // 5th grade: Vision + Hearing + Acanthosis + (Scoliosis for females/other)
  if (gradeNumber === 5) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    if (isFemale || isOther) {
      requiredScreenings.scoliosis = true;
    }
    return requiredScreenings;
  }

  // 6th grade NEW students: Vision + Hearing + Acanthosis
  if (gradeNumber === 6 && isNewStudent) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  // 7th grade: Vision + Hearing + Acanthosis + (Scoliosis for females/other)
  if (gradeNumber === 7) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    if (isFemale || isOther) {
      requiredScreenings.scoliosis = true;
    }
    return requiredScreenings;
  }

  // 8th grade males: Scoliosis (returning), all tests if NEW
  if (gradeNumber === 8) {
    if (gender === 'male') {
      if (isNewStudent) {
        requiredScreenings.vision = true;
        requiredScreenings.hearing = true;
        requiredScreenings.acanthosis = true;
        requiredScreenings.scoliosis = true;
      } else {
        requiredScreenings.scoliosis = true;
      }
    }
    // 8th grade females: Vision + Hearing + Acanthosis (if NEW only)
    else if (isFemale && isNewStudent) {
      requiredScreenings.vision = true;
      requiredScreenings.hearing = true;
      requiredScreenings.acanthosis = true;
    }
    // 8th grade other: All tests
    else if (isOther) {
      requiredScreenings.vision = true;
      requiredScreenings.hearing = true;
      requiredScreenings.acanthosis = true;
      requiredScreenings.scoliosis = true;
    }
    return requiredScreenings;
  }

  // 9th-12th grade NEW students: Vision + Hearing + Acanthosis
  if (gradeNumber >= 9 && gradeNumber <= 12 && isNewStudent) {
    requiredScreenings.vision = true;
    requiredScreenings.hearing = true;
    requiredScreenings.acanthosis = true;
    return requiredScreenings;
  }

  return requiredScreenings;
}

/**
 * Extract numeric grade from grade string
 * @param {string} grade - Grade string (e.g., "1st grade", "Kindergarten")
 * @returns {number} Numeric grade value
 */
function extractGradeNumber(grade) {
  if (!grade) return null;
  
  const gradeMap = {
    'Pre-K (3)': -1,
    'Pre-K (4)': 0,
    'Kindergarten': 0,
    '1st': 1,
    '1st grade': 1,
    '2nd': 2,
    '2nd grade': 2,
    '3rd': 3,
    '3rd grade': 3,
    '4th': 4,
    '4th grade': 4,
    '5th': 5,
    '5th grade': 5,
    '6th': 6,
    '6th grade': 6,
    '7th': 7,
    '7th grade': 7,
    '8th': 8,
    '8th grade': 8,
    '9th': 9,
    '9th grade': 9,
    '10th': 10,
    '10th grade': 10,
    '11th': 11,
    '11th grade': 11,
    '12th': 12,
    '12th grade': 12
  };

  return gradeMap[grade] || null;
}

/**
 * Check if student was born before cutoff date for age requirement
 * @param {string} dob - Date of birth (YYYY-MM-DD)
 * @param {number} ageCutoff - Required age
 * @returns {boolean} True if born before cutoff
 */
function isBornBeforeCutoff(dob, ageCutoff) {
  if (!dob) return false;
  
  const birthDate = new Date(dob);
  const currentYear = new Date().getFullYear();
  const cutoffDate = new Date(currentYear, 8, 1); // September 1st
  
  // Calculate age as of cutoff date
  const age = cutoffDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = cutoffDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < birthDate.getDate())) {
    return age - 1 >= ageCutoff;
  }
  
  return age >= ageCutoff;
}

/**
 * Get list of required screening names
 * @param {Object} requiredScreenings - Object from calculateRequiredScreenings
 * @returns {Array} Array of required screening names
 */
function getRequiredScreeningNames(requiredScreenings) {
  const screenings = [];
  if (requiredScreenings.vision) screenings.push('vision');
  if (requiredScreenings.hearing) screenings.push('hearing');
  if (requiredScreenings.acanthosis) screenings.push('acanthosis');
  if (requiredScreenings.scoliosis) screenings.push('scoliosis');
  return screenings;
}

module.exports = {
  calculateRequiredScreenings,
  extractGradeNumber,
  isBornBeforeCutoff,
  getRequiredScreeningNames
};
