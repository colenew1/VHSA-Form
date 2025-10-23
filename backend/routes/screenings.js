const express = require('express');
const supabase = require('../utils/supabase');

const router = express.Router();

/**
 * POST /api/screenings
 * Submit screening results with support for partial updates
 */
router.post('/', async (req, res) => {
  try {
    const {
      uniqueId,
      absent,
      notes,
      vision,
      hearing,
      acanthosis,
      scoliosis,
      screeningYear,
      screeningEventDate
    } = req.body;

    // Validate required fields
    if (!uniqueId) {
      return res.status(400).json({ error: 'Unique ID is required' });
    }

    // Find student by unique_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, school')
      .eq('unique_id', uniqueId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if screening result already exists for this student
    const { data: existingScreening, error: screeningError } = await supabase
      .from('screening_results')
      .select('*')
      .eq('student_id', student.id)
      .eq('screening_year', screeningYear || new Date().getFullYear())
      .single();

    let screeningData = {
      student_id: student.id,
      school: student.school,
      screening_year: screeningYear || new Date().getFullYear(),
      screening_event_date: screeningEventDate || new Date().toISOString().split('T')[0]
    };

    // Only update fields that have values (don't overwrite with null)
    if (absent !== undefined) screeningData.absent = absent;
    if (notes !== undefined) screeningData.notes = notes;

    // Process vision data
    if (vision) {
      Object.keys(vision).forEach(day => {
        const dayData = vision[day];
        if (dayData) {
          if (dayData.screener) screeningData[`vision_${day}_screener`] = dayData.screener;
          if (dayData.result) screeningData[`vision_${day}_result`] = dayData.result;
          if (dayData.rightEye) screeningData[`vision_${day}_right_eye`] = dayData.rightEye;
          if (dayData.leftEye) screeningData[`vision_${day}_left_eye`] = dayData.leftEye;
        }
      });
    }

    // Process hearing data
    if (hearing) {
      Object.keys(hearing).forEach(day => {
        const dayData = hearing[day];
        if (dayData) {
          if (dayData.screener) screeningData[`hearing_${day}_screener`] = dayData.screener;
          if (dayData.result) screeningData[`hearing_${day}_result`] = dayData.result;
          if (dayData.right1000) screeningData[`hearing_${day}_right_1000`] = dayData.right1000;
          if (dayData.right2000) screeningData[`hearing_${day}_right_2000`] = dayData.right2000;
          if (dayData.right4000) screeningData[`hearing_${day}_right_4000`] = dayData.right4000;
          if (dayData.left1000) screeningData[`hearing_${day}_left_1000`] = dayData.left1000;
          if (dayData.left2000) screeningData[`hearing_${day}_left_2000`] = dayData.left2000;
          if (dayData.left4000) screeningData[`hearing_${day}_left_4000`] = dayData.left4000;
        }
      });
    }

    // Process acanthosis data
    if (acanthosis) {
      Object.keys(acanthosis).forEach(day => {
        const dayData = acanthosis[day];
        if (dayData) {
          if (dayData.screener) screeningData[`acanthosis_${day}_screener`] = dayData.screener;
          if (dayData.result) screeningData[`acanthosis_${day}_result`] = dayData.result;
        }
      });
    }

    // Process scoliosis data
    if (scoliosis) {
      Object.keys(scoliosis).forEach(day => {
        const dayData = scoliosis[day];
        if (dayData) {
          if (dayData.screener) screeningData[`scoliosis_${day}_screener`] = dayData.screener;
          if (dayData.result) screeningData[`scoliosis_${day}_result`] = dayData.result;
        }
      });
    }

    let result;
    if (existingScreening) {
      // Update existing screening
      const { data, error } = await supabase
        .from('screening_results')
        .update(screeningData)
        .eq('id', existingScreening.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new screening
      const { data, error } = await supabase
        .from('screening_results')
        .insert(screeningData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(200).json({
      success: true,
      message: existingScreening ? 'Screening updated successfully' : 'Screening created successfully',
      screening: result
    });

  } catch (error) {
    console.error('Error saving screening:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/screenings/:studentId
 * Get screening results for a specific student
 */
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { screeningYear } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    let query = supabase
      .from('screening_results')
      .select('*')
      .eq('student_id', studentId);

    if (screeningYear) {
      query = query.eq('screening_year', parseInt(screeningYear));
    }

    const { data: screenings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      screenings: screenings || [],
      total: screenings ? screenings.length : 0
    });

  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/screenings
 * Get all screening results (for admin panel)
 */
router.get('/', async (req, res) => {
  try {
    const { school, screeningYear, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('screening_results')
      .select(`
        *,
        students!inner(
          id,
          unique_id,
          first_name,
          last_name,
          grade,
          gender,
          school,
          teacher
        )
      `);

    if (school) {
      query = query.eq('school', school);
    }

    if (screeningYear) {
      query = query.eq('screening_year', parseInt(screeningYear));
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: screenings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      screenings: screenings || [],
      total: screenings ? screenings.length : 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching all screenings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
