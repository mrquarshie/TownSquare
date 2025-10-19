const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/items
// @desc    Get all items with filtering and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      university, 
      minPrice, 
      maxPrice, 
      condition,
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { isAvailable: true, isSold: false };
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by university
    if (university) {
      query.university = university;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by condition
    if (condition) {
      query.condition = condition;
    }

    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .populate('seller', 'name university')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name email university phone');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items
// @desc    Create new item (sellers only)
// @access  Private
router.post('/', auth, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['electronics', 'books', 'clothing', 'furniture', 'sports', 'accessories', 'other']).withMessage('Invalid category'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.userId);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create items' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const { title, description, price, category, condition } = req.body;
    const images = req.files.map(file => file.filename);

    const item = new Item({
      title,
      description,
      price: Number(price),
      category,
      condition,
      images,
      seller: req.userId,
      university: user.university
    });

    await item.save();
    await item.populate('seller', 'name university');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item (seller only)
// @access  Private
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, price, category, condition, isAvailable } = req.body;
    
    if (title) item.title = title;
    if (description) item.description = description;
    if (price) item.price = Number(price);
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      item.images = [...item.images, ...newImages];
    }

    await item.save();
    await item.populate('seller', 'name university');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item (seller only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/seller/my-items
// @desc    Get seller's items
// @access  Private
router.get('/seller/my-items', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can view their items' });
    }

    const items = await Item.find({ seller: req.userId })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get seller items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
