const express = require('express');

const router = express.Router();

/**
 * GET /api/schools
 * Return list of all schools for populating dropdown in frontend
 */
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const supabase = req.supabase;

    let query = supabase
      .from('schools')
      .select('*')
      .order('name', { ascending: true });

    // Filter by active status if specified
    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    const { data: schools, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      schools: schools || [],
      total: schools ? schools.length : 0
    });

  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/schools
 * Create a new school
 */
router.post('/', async (req, res) => {
  try {
    const { name, active = true } = req.body;
    const supabase = req.supabase;

    if (!name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    const { data: newSchool, error } = await supabase
      .from('schools')
      .insert({
        name: name.trim(),
        active: active
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'School with this name already exists' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      school: newSchool
    });

  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/schools/:id
 * Update a school
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (active !== undefined) updateData.active = active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: updatedSchool, error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'School not found' });
      }
      if (error.code === '23505') {
        return res.status(409).json({ error: 'School with this name already exists' });
      }
      throw error;
    }

    res.json({
      success: true,
      school: updatedSchool
    });

  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/schools/:id
 * Soft delete a school (set active to false)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    const { data: updatedSchool, error } = await supabase
      .from('schools')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'School not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'School deactivated successfully',
      school: updatedSchool
    });

  } catch (error) {
    console.error('Error deactivating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
