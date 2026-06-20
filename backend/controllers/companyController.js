import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Admin)
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    
    // Dynamically calculate activeJobs and totalHires based on Jobs and Applications
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        // Count active jobs for this company
        const activeJobsCount = await Job.countDocuments({
          company: { $regex: new RegExp(`^${company.name}$`, 'i') },
          status: 'active'
        });

        // Find all jobs for this company to count hires from applications
        const companyJobs = await Job.find({
          company: { $regex: new RegExp(`^${company.name}$`, 'i') }
        });
        const jobIds = companyJobs.map(j => j._id);

        // Count applications with status 'Offered'
        const totalHiresCount = await Application.countDocuments({
          job: { $in: jobIds },
          status: 'Offered'
        });

        const companyObj = company.toObject();
        companyObj.activeJobs = activeJobsCount;
        companyObj.totalHires = totalHiresCount;
        return companyObj;
      })
    );

    res.json(companiesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Admin)
export const createCompany = async (req, res) => {
  const { name, industry, location, website, contact, logoColor } = req.body;

  try {
    if (!name || !industry || !location || !contact) {
      return res.status(400).json({ message: 'Please provide all required fields (name, industry, location, contact)' });
    }

    const companyExists = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (companyExists) {
      return res.status(400).json({ message: 'Company with this name already exists' });
    }

    const company = await Company.create({
      name,
      industry,
      location,
      website,
      contact,
      logoColor,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (company) {
      await company.deleteOne();
      res.json({ message: 'Company removed successfully' });
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private (Admin)
export const updateCompany = async (req, res) => {
  const { name, industry, location, website, contact } = req.body;

  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // If name is changing, check if another company has the new name
    if (name && name.toLowerCase() !== company.name.toLowerCase()) {
      const companyExists = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (companyExists) {
        return res.status(400).json({ message: 'Company with this name already exists' });
      }
    }

    if (name) company.name = name;
    if (industry) company.industry = industry;
    if (location) company.location = location;
    if (website !== undefined) company.website = website;
    if (contact) company.contact = contact;

    const updatedCompany = await company.save();
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
