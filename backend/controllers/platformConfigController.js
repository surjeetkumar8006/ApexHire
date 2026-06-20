import PlatformConfig from '../models/PlatformConfig.js';

// @desc    Get platform configurations (auto-creates one if empty)
// @route   GET /api/platform-config
// @access  Private
export const getPlatformConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne({});
    if (!config) {
      config = await PlatformConfig.create({
        driveName: 'ApexHire Drive 2026',
        academicYear: '2026-27',
        minCgpa: 6.5,
        allowedBranches: 'CSE, ECE, EEE, ME',
        coordinatorEmail: 'coordinator@accio.com',
        autoVerify: false,
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update platform configurations
// @route   PUT /api/platform-config
// @access  Private (Admin only)
export const updatePlatformConfig = async (req, res) => {
  const { driveName, academicYear, minCgpa, allowedBranches, coordinatorEmail, autoVerify } = req.body;

  try {
    let config = await PlatformConfig.findOne({});
    if (!config) {
      config = new PlatformConfig();
    }

    if (driveName !== undefined) config.driveName = driveName;
    if (academicYear !== undefined) config.academicYear = academicYear;
    if (minCgpa !== undefined) config.minCgpa = Number(minCgpa);
    if (allowedBranches !== undefined) config.allowedBranches = allowedBranches;
    if (coordinatorEmail !== undefined) config.coordinatorEmail = coordinatorEmail;
    if (autoVerify !== undefined) config.autoVerify = autoVerify;

    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
