const SavedJob = require('../models/SavedJob');
const { searchAllJobs } = require('../services/jobSearchService');

const searchJobs = async (req, res, next) => {
  try {
    const { query, location, type, remote } = req.query;

    const jobs = await searchAllJobs({ query, location, type, remote });

    res.json({
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const { title, company, location, url, source } = req.body;

    if (!title || !url || !source) {
      return res.status(400).json({ message: 'Title, URL, and source are required' });
    }

    const savedJob = await SavedJob.create({
      userId: req.userId,
      title,
      company: company || '',
      location: location || '',
      url,
      source,
    });

    res.status(201).json({
      message: 'Job saved successfully',
      savedJob,
    });
  } catch (err) {
    next(err);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.userId }).sort({ savedAt: -1 });

    res.json({
      count: savedJobs.length,
      savedJobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchJobs,
  saveJob,
  getSavedJobs,
};
