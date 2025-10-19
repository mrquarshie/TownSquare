const express = require('express');
const University = require('../models/University');

const router = express.Router();

// @route   GET /api/universities
// @desc    Get all universities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const universities = await University.find({ isActive: true })
      .sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/universities/seed
// @desc    Seed universities data (development only)
// @access  Public
router.post('/seed', async (req, res) => {
  try {
    // Check if universities already exist
    const existingCount = await University.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Universities already seeded' });
    }

    const universities = [
      { name: 'University of Ghana', abbreviation: 'UG', location: 'Legon, Accra', region: 'Greater Accra' },
      { name: 'Kwame Nkrumah University of Science and Technology', abbreviation: 'KNUST', location: 'Kumasi', region: 'Ashanti' },
      { name: 'University of Cape Coast', abbreviation: 'UCC', location: 'Cape Coast', region: 'Central' },
      { name: 'University of Education, Winneba', abbreviation: 'UEW', location: 'Winneba', region: 'Central' },
      { name: 'University for Development Studies', abbreviation: 'UDS', location: 'Tamale', region: 'Northern' },
      { name: 'Ghana Institute of Management and Public Administration', abbreviation: 'GIMPA', location: 'Accra', region: 'Greater Accra' },
      { name: 'Ashesi University', abbreviation: 'Ashesi', location: 'Berekuso', region: 'Eastern' },
      { name: 'Central University', abbreviation: 'CUC', location: 'Miotso', region: 'Greater Accra' },
      { name: 'Presbyterian University College', abbreviation: 'PUC', location: 'Abetifi', region: 'Eastern' },
      { name: 'Valley View University', abbreviation: 'VVU', location: 'Techiman', region: 'Brong-Ahafo' },
      { name: 'University of Professional Studies', abbreviation: 'UPSA', location: 'Accra', region: 'Greater Accra' },
      { name: 'Ghana Technology University College', abbreviation: 'GTUC', location: 'Accra', region: 'Greater Accra' },
      { name: 'Regent University College', abbreviation: 'RUC', location: 'Accra', region: 'Greater Accra' },
      { name: 'Wisconsin International University College', abbreviation: 'WIUC', location: 'Accra', region: 'Greater Accra' },
      { name: 'Methodist University College', abbreviation: 'MUCG', location: 'Accra', region: 'Greater Accra' },
      { name: 'Catholic University College', abbreviation: 'CUCG', location: 'Fiapre', region: 'Brong-Ahafo' },
      { name: 'Islamic University College', abbreviation: 'IUCG', location: 'Accra', region: 'Greater Accra' },
      { name: 'Pentecost University College', abbreviation: 'PUC', location: 'Accra', region: 'Greater Accra' },
      { name: 'Accra Institute of Technology', abbreviation: 'AIT', location: 'Accra', region: 'Greater Accra' },
      { name: 'BlueCrest University College', abbreviation: 'BCUC', location: 'Accra', region: 'Greater Accra' }
    ];

    await University.insertMany(universities);
    res.json({ message: 'Universities seeded successfully', count: universities.length });
  } catch (error) {
    console.error('Seed universities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
