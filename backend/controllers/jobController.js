import Job from '../models/Job.js';
import Profile from '../models/Profile.js';

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
      if (req.user.role === 'recruiter' && job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to modify this job' });
      }

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
      if (req.user.role === 'recruiter' && job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this job' });
      }

      await job.deleteOne();
      res.json({ message: 'Job removed successfully' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job recommendations based on user skills and profile
// @route   GET /api/jobs/recommendations
// @access  Private (Student)
export const getRecommendedJobs = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const userSkills = profile?.skills || [];
    const lowerUserSkills = userSkills.map(s => String(s).toLowerCase().trim());
    const resumeText = (profile?.resumeParsedText || '').toLowerCase();

    const jobs = await Job.find({ status: 'active' }).populate('postedBy', 'name email role');

    const recommendedJobs = jobs.map((job) => {
      // 1. Extract requirements
      let reqSkills = [];
      if (Array.isArray(job.requirements)) {
        reqSkills = job.requirements.map(r => String(r).toLowerCase().trim()).filter(Boolean);
      } else if (typeof job.requirements === 'string' && job.requirements.trim()) {
        reqSkills = job.requirements.toLowerCase().split(',').map(r => r.trim()).filter(Boolean);
      }

      // 2. Extract title & description keywords
      const titleWords = (job.title || '')
        .toLowerCase()
        .split(/[\s,/-]+/)
        .filter(w => w.length >= 2 && !['and', 'the', 'for', 'with', 'intern', 'trainee'].includes(w));

      // Domain defaults for SDE / Software roles
      const isSdeRole = titleWords.some(w => ['sde', 'software', 'developer', 'engineer', 'backend', 'frontend', 'fullstack', 'code'].includes(w));
      const targetKeywords = [...new Set([...reqSkills, ...titleWords])];

      // 3. Calculate Overlap
      const checkMatch = (reqStr) => {
        const r = String(reqStr).toLowerCase().trim();
        const mernList = ['mern', 'react', 'node', 'nodejs', 'express', 'mongodb', 'javascript'];
        const meanList = ['mean', 'angular', 'node', 'nodejs', 'express', 'mongodb'];

        const matchedInSkills = lowerUserSkills.some(uSkill => {
          if (uSkill.includes(r) || r.includes(uSkill)) return true;
          if (r.includes('mern') && mernList.some(m => uSkill.includes(m))) return true;
          if (r.includes('mean') && meanList.some(m => uSkill.includes(m))) return true;
          return false;
        });

        if (matchedInSkills) return true;
        if (resumeText && resumeText.includes(r)) return true;
        return false;
      };

      // 3. Calculate Overlap
      const matchingSkills = [];
      const missingSkills = [];

      reqSkills.forEach(req => {
        if (checkMatch(req)) {
          matchingSkills.push(req);
        } else {
          missingSkills.push(req);
        }
      });

      // 4. Compute Match Percentage dynamically
      let matchPercentage = 0;
      if (reqSkills.length > 0) {
        const matchedCount = matchingSkills.length;
        if (matchedCount === 0) {
          // Zero required skills matched -> Low fit score (max 20%)
          matchPercentage = lowerUserSkills.length > 0 ? 20 : 10;
        } else {
          const ratio = matchedCount / reqSkills.length;
          const baseScore = Math.round(ratio * 75);
          const bonus = Math.min(20, Math.round(lowerUserSkills.length * 3));
          matchPercentage = Math.min(98, baseScore + bonus + 5);
        }
      } else if (targetKeywords.length > 0) {
        const overlapCount = targetKeywords.filter(kw => checkMatch(kw)).length;
        matchPercentage = Math.round((overlapCount / targetKeywords.length) * 100);
        matchPercentage = Math.min(95, Math.max(30, matchPercentage));
      } else {
        matchPercentage = lowerUserSkills.length > 0 ? 50 : 25;
      }

      matchPercentage = Math.min(99, Math.max(10, matchPercentage));

      return {
        ...job.toObject(),
        matchPercentage,
        matchingSkills,
        missingSkills,
      };
    });

    // Sort by match score descending
    recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(recommendedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
