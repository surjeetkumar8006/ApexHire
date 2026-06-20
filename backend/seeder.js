import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import Notification from './models/Notification.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing collection records
    await User.deleteMany();
    await Profile.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Notification.deleteMany();

    console.log('Database cleared...');

    // 1. Create Users
    const studentUser = await User.create({
      name: 'Aravind Sharma',
      email: 'student@accio.com',
      password: 'studentpassword123',
      role: 'student',
    });

    const adminUser = await User.create({
      name: 'Priyanshu (AccioJob)',
      email: 'admin@accio.com',
      password: 'adminpassword123',
      role: 'admin',
    });

    console.log('Users seeded successfully...');

    // 2. Create Student Profile
    const studentProfile = await Profile.create({
      user: studentUser._id,
      skills: ['JavaScript', 'React.js', 'Node.js', 'Git', 'SQL', 'CSS3'],
      education: [
        {
          school: 'Delhi Technological University',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startYear: '2022',
          endYear: '2026',
          cgpa: '9.2',
        },
      ],
      experience: [
        {
          company: 'Coding Club DTU',
          position: 'Web Lead',
          duration: '6 Months',
          description: 'Managed a team of 4 to design, build, and deploy the official hackathon submission portal using React.',
        },
      ],
      resumeUrl: '',
      aiFeedback: {
        score: 78,
        suggestions: [
          'Add a distinct EXPERIENCE section explaining internship details.',
          'Add cloud deployment keywords like AWS or Docker to expand matches.',
          'Quantify project achievements with percentages (e.g., improved search times by 20%).',
        ],
        matchedRoles: ['Frontend Engineer', 'Full-Stack Developer'],
      },
    });

    console.log('Student profile seeded...');

    // 3. Create Job Listings
    const job1 = await Job.create({
      title: 'Associate Software Engineer',
      company: 'Google',
      description: 'We are seeking an entry-level Software Engineer to join our core search infrastructure team. You will participate in building scalable cloud backend systems and optimizing database latency.',
      requirements: ['Java', 'C++', 'Python', 'Databases', 'Git'],
      location: 'Bangalore, India (Hybrid)',
      type: 'Full-time',
      salary: '₹18L - ₹24L PA',
      postedBy: adminUser._id,
    });

    const job2 = await Job.create({
      title: 'Frontend Developer Intern',
      company: 'Meta',
      description: 'Join the product engineering group working on Instagram Web. You will design responsive user interfaces, manage complex local application states, and profile page performance.',
      requirements: ['JavaScript', 'React.js', 'TypeScript', 'CSS', 'HTML5'],
      location: 'Remote (Worldwide)',
      type: 'Internship',
      salary: '₹60,000 / Month',
      postedBy: adminUser._id,
    });

    const job3 = await Job.create({
      title: 'Backend Systems Engineer',
      company: 'Amazon',
      description: 'Build backend microservices for AWS Lambda and API Gateway. Focus on writing clean asynchronous JavaScript/Python, designing REST APIs, and maintaining DynamoDB collections.',
      requirements: ['Node.js', 'Express', 'Python', 'SQL', 'AWS', 'Docker'],
      location: 'Hyderabad, India (On-site)',
      type: 'Full-time',
      salary: '₹14L - ₹20L PA',
      postedBy: adminUser._id,
    });

    console.log('Job Listings seeded...');

    // 4. Create sample Application (student applied to Meta)
    const application = await Application.create({
      job: job2._id,
      student: studentUser._id,
      resumeUrl: '/uploads/sample-resume.pdf', // mock resume URL
      status: 'Reviewing',
      feedback: 'Great initial skills match. Resume score is 78/100.',
    });

    // Seed mock resume url on profile too
    studentProfile.resumeUrl = '/uploads/sample-resume.pdf';
    await studentProfile.save();

    console.log('Sample Job Application seeded...');

    // 5. Create Notification
    await Notification.create({
      recipient: studentUser._id,
      title: 'Application Update: Frontend Developer Intern',
      message: 'Your application status for Frontend Developer Intern at Meta has been updated to "Reviewing". Feedback: Great initial skills match. Resume score is 78/100.',
    });

    console.log('Notification seeded...');
    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
