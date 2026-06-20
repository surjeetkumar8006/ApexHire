import Job from '../models/Job.js';

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { keyword, location, type } = req.query;
    let query = { status: 'active' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    const jobs = await Job.find(query).populate('postedBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Admin)
export const createJob = async (req, res) => {
  const { title, company, description, requirements, location, type, salary } = req.body;

  try {
    const job = await Job.create({
      title,
      company,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split(',').map(req => req.trim()),
      location,
      type,
      salary,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
export const updateJob = async (req, res) => {
  const { title, company, description, requirements, location, type, salary, status } = req.body;

  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (title) job.title = title;
      if (company) job.company = company;
      if (description) job.description = description;
      if (requirements) {
        job.requirements = Array.isArray(requirements) ? requirements : requirements.split(',').map(req => req.trim());
      }
      if (location) job.location = location;
      if (type) job.type = type;
      if (salary) job.salary = salary;
      if (status) job.status = status;

      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Close a job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed successfully' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
