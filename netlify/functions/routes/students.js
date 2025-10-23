const express = require('express');
const { calculateRequiredScreenings } = require('../utils/screening-rules');

const router = express.Router();

/**
 * GET /api/students/:uniqueId
 * Search student by unique_id and return student data + required screenings
 */
router.get('/:uniqueId', async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const supabase = req.supabase;

    if (!uniqueId) {
      return res.status(400).json({ error: 'Unique ID is required' });
    }

    // Search for student by unique_id
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('unique_id', uniqueId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return res.json({ found: false });
      }
      throw error;
    }

    if (!student) {
      return res.json({ found: false });
    }

    // Calculate required screenings
    const requiredScreenings = calculateRequiredScreenings(
      student.grade,
      student.gender,
      student.status,
      student.dob
    );

    // Return student data with required screenings
    res.json({
      found: true,
      student: {
        id: student.id,
        uniqueId: student.unique_id,
        firstName: student.first_name,
        lastName: student.last_name,
        grade: student.grade,
        gender: student.gender,
        school: student.school,
        teacher: student.teacher,
        dob: student.dob,
        status: student.status,
        createdAt: student.created_at
      },
      requiredScreenings
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/students/quick-add
 * Create new student on the fly with auto-generated unique_id
 */
router.post('/quick-add', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      grade,
      gender,
      school,
      teacher,
      dob,
      status
    } = req.body;
    
    const supabase = req.supabase;

    // Validate required fields
    if (!firstName || !lastName || !grade || !gender || !school || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, grade, gender, school, status' 
      });
    }

    // Generate unique_id
    const uniqueId = await generateUniqueId(school, supabase);

    // Create student
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        unique_id: uniqueId,
        first_name: firstName,
        last_name: lastName,
        grade: grade,
        gender: gender,
        school: school,
        teacher: teacher || null,
        dob: dob || null,
        status: status
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Calculate required screenings
    const requiredScreenings = calculateRequiredScreenings(
      newStudent.grade,
      newStudent.gender,
      newStudent.status,
      newStudent.dob
    );

    res.status(201).json({
      success: true,
      student: {
        id: newStudent.id,
        uniqueId: newStudent.unique_id,
        firstName: newStudent.first_name,
        lastName: newStudent.last_name,
        grade: newStudent.grade,
        gender: newStudent.gender,
        school: newStudent.school,
        teacher: newStudent.teacher,
        dob: newStudent.dob,
        status: newStudent.status,
        createdAt: newStudent.created_at
      },
      requiredScreenings
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/students
 * Get all students with screening completion status for admin panel
 */
router.get('/', async (req, res) => {
  try {
    const supabase = req.supabase;

    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });

    if (studentsError) {
      throw studentsError;
    }

    // Get screening results for all students
    const studentIds = students.map(s => s.id);
    const { data: screeningResults, error: screeningError } = await supabase
      .from('screening_results')
      .select('*')
      .in('student_id', studentIds);

    if (screeningError) {
      throw screeningError;
    }

    // Process students with screening completion status
    const studentsWithStatus = students.map(student => {
      const requiredScreenings = calculateRequiredScreenings(
        student.grade,
        student.gender,
        student.status,
        student.dob
      );

      const studentScreening = screeningResults.find(sr => sr.student_id === student.id);
      
      // Check completion status for each required screening
      const completionStatus = {
        vision: false,
        hearing: false,
        acanthosis: false,
        scoliosis: false
      };

      if (studentScreening) {
        completionStatus.vision = requiredScreenings.vision ? 
          !!(studentScreening.vision_day1_result || studentScreening.vision_day2_result) : true;
        completionStatus.hearing = requiredScreenings.hearing ? 
          !!(studentScreening.hearing_day1_result || studentScreening.hearing_day2_result) : true;
        completionStatus.acanthosis = requiredScreenings.acanthosis ? 
          !!(studentScreening.acanthosis_day1_result || studentScreening.acanthosis_day2_result) : true;
        completionStatus.scoliosis = requiredScreenings.scoliosis ? 
          !!(studentScreening.scoliosis_day1_result || studentScreening.scoliosis_day2_result) : true;
      }

      const allComplete = Object.values(completionStatus).every(status => status === true);

      return {
        id: student.id,
        uniqueId: student.unique_id,
        firstName: student.first_name,
        lastName: student.last_name,
        grade: student.grade,
        gender: student.gender,
        school: student.school,
        teacher: student.teacher,
        dob: student.dob,
        status: student.status,
        createdAt: student.created_at,
        requiredScreenings,
        completionStatus,
        allComplete
      };
    });

    res.json({
      students: studentsWithStatus,
      total: studentsWithStatus.length,
      completed: studentsWithStatus.filter(s => s.allComplete).length,
      incomplete: studentsWithStatus.filter(s => !s.allComplete).length
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate unique ID for a student based on school
 * @param {string} school - School name
 * @param {object} supabase - Supabase client
 * @returns {string} Generated unique ID (e.g., "st0151")
 */
async function generateUniqueId(school, supabase) {
  try {
    // Extract school code (assuming school names have codes like "School Name (st01)")
    const schoolCodeMatch = school.match(/\(([^)]+)\)/);
    const schoolCode = schoolCodeMatch ? schoolCodeMatch[1] : 'st01';

    // Find the highest existing ID for this school
    const { data: existingStudents, error } = await supabase
      .from('students')
      .select('unique_id')
      .like('unique_id', `${schoolCode}%`)
      .order('unique_id', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    let nextNumber = 1;
    if (existingStudents && existingStudents.length > 0) {
      const lastId = existingStudents[0].unique_id;
      const numberMatch = lastId.match(/(\d+)$/);
      if (numberMatch) {
        nextNumber = parseInt(numberMatch[1]) + 1;
      }
    }

    // Format with leading zeros (e.g., "st0100", "st0101")
    const paddedNumber = nextNumber.toString().padStart(2, '0');
    return `${schoolCode}${paddedNumber}`;

  } catch (error) {
    console.error('Error generating unique ID:', error);
    // Fallback to timestamp-based ID
    return `st01${Date.now().toString().slice(-4)}`;
  }
}

module.exports = router;
