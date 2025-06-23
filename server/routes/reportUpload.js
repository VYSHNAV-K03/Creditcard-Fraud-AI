const express = require('express');
const upload = require('../config/multerConfig'); // Import Multer config
const authenticateUser = require('../middleware/authMiddleware');
const Report = require('../models/Report'); // Import the Report model
const fs = require('fs'); // For file deletion
const path = require('path');

const router = express.Router();

// POST route for uploading reports
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
    const { title, description } = req.body;
  
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
  
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }

    console.log(req.file);
    
  
    try {
      // Create a new report with user details
      const report = new Report({
        title,
        description,
        filePath: req.file.path,
        uploadedBy: req.user._id, // Attach the user ID
      });
  
      // Save to database
      await report.save();
  
      res.status(201).json({
        message: 'Report uploaded successfully!',
        report,
      });
    } catch (error) {
      console.error('Error saving report:', error);
      res.status(500).json({ error: 'Failed to save the report.' });
    }
  });


  // GET route to fetch the user's reports
router.get('/user-reports', authenticateUser, async (req, res) => {
  try {
    // Fetch reports uploaded by the authenticated user
    const reports = await Report.find({ uploadedBy: req.user._id }).sort({ uploadedAt: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});


// DELETE route for deleting reports
router.delete('/delete/:id', authenticateUser, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Check if the user is authorized to delete the report
    if (report.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this report.' });
    }

    // Construct file path
    const filePath = path.join(__dirname, '..', report.filePath);

    // Delete the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      console.warn(`File not found: ${filePath}`);
    }

    console.log(report);
    
    // Delete the report from the database
    await Report.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Report deleted successfully.' });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete the report.' });
  }
});

  
module.exports = router;
