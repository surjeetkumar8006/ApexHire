import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

// Helper to parse salary string to LPA
const parseSalaryToLPA = (salaryStr) => {
  if (!salaryStr || typeof salaryStr !== 'string' || salaryStr.toLowerCase() === 'not specified') {
    return null;
  }
  
  // Clean string (remove symbol, commas, and trim)
  const cleanStr = salaryStr.replace(/₹/g, '').replace(/,/g, '').trim();
  
  // Check if it is monthly salary e.g. "₹60,000 / Month"
  if (cleanStr.toLowerCase().includes('/ month') || cleanStr.toLowerCase().includes('/month')) {
    const match = cleanStr.match(/\d+/);
    if (match) {
      const monthly = parseFloat(match[0]);
      return (monthly * 12) / 100000; // Convert to LPA
    }
  }

  // Check if it has a range e.g. "18L - 24L" or "18 - 24 LPA"
  const rangeMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*[LLakhs]*\s*-\s*(\d+(?:\.\d+)?)\s*[LLakhs]*/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return (min + max) / 2;
  }

  // Check if single number e.g. "18L" or "18 LPA"
  const singleMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*[LLakhs]*/i);
  if (singleMatch) {
    return parseFloat(singleMatch[1]);
  }

  return null;
};

// @desc    Get admin dashboard analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Fetch all placements (Applications with status 'Offered')
    const placements = await Application.find({ status: 'Offered' }).populate('job');
    
    // 2. Count Active Partners
    const activePartnersCount = await Company.countDocuments({});

    // 3. Process packages & industries
    let totalLPA = 0;
    let validSalariesCount = 0;
    let highestLPA = 0;
    
    // Distribution Buckets
    const packageDistribution = {
      '3-5 LPA': 0,
      '5-8 LPA': 0,
      '8-12 LPA': 0,
      '12-20 LPA': 0,
      '20+ LPA': 0
    };

    // Industry Counts
    const industryCounts = {};

    for (const placement of placements) {
      if (placement.job) {
        // Parse Salary
        const lpa = parseSalaryToLPA(placement.job.salary);
        if (lpa !== null) {
          totalLPA += lpa;
          validSalariesCount++;
          if (lpa > highestLPA) {
            highestLPA = lpa;
          }

          // Bucket Placement
          if (lpa >= 3 && lpa < 5) packageDistribution['3-5 LPA']++;
          else if (lpa >= 5 && lpa < 8) packageDistribution['5-8 LPA']++;
          else if (lpa >= 8 && lpa < 12) packageDistribution['8-12 LPA']++;
          else if (lpa >= 12 && lpa < 20) packageDistribution['12-20 LPA']++;
          else if (lpa >= 20) packageDistribution['20+ LPA']++;
        }

        // Parse Company Industry
        const companyName = placement.job.company;
        const company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
        const industry = company ? company.industry : 'Other';
        industryCounts[industry] = (industryCounts[industry] || 0) + 1;
      }
    }

    const avgLPA = validSalariesCount > 0 ? parseFloat((totalLPA / validSalariesCount).toFixed(1)) : 0;
    highestLPA = parseFloat(highestLPA.toFixed(1));

    // Format Industry Data for Pie Chart
    const industryData = Object.keys(industryCounts).map(name => ({
      name,
      value: industryCounts[name]
    })).sort((a, b) => b.value - a.value);

    // 4. Calculate Placement Trends (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const placementTrends = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const monthName = monthNames[monthIndex];

      // Count placements in this month and year
      const startOfMonth = new Date(year, monthIndex, 1);
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      const count = await Application.countDocuments({
        status: 'Offered',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      placementTrends.push({
        month: monthName,
        offers: count
      });
    }

    // Format Package Distribution for Bar Chart
    const packageData = Object.keys(packageDistribution).map(range => ({
      range,
      count: packageDistribution[range]
    }));

    res.json({
      summary: {
        avgPackage: avgLPA,
        highestPackage: highestLPA,
        totalPlaced: placements.length,
        activePartners: activePartnersCount
      },
      placementTrends,
      packageDistribution: packageData,
      industryData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
