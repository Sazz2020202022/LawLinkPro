import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

dotenv.config();

const allowedSpecializations = [
  'Family Law',
  'Criminal Law',
  'Property Law',
  'Corporate Law',
  'Cyber Law',
  'Immigration Law',
  'Labour Law',
  'Tax Law',
];

const bioBySpecialization = {
  'Family Law':
    'Handles divorce, child custody, alimony, and marriage registration matters with practical guidance and strong representation in family courts.',
  'Criminal Law':
    'Represents clients in bail applications, court hearings, criminal defense strategy, and FIR-related matters from investigation to trial.',
  'Property Law':
    'Advises on land disputes, ownership transfer, tenancy conflicts, and partition claims with clear documentation and litigation support.',
  'Corporate Law':
    'Supports businesses with contracts, compliance, company registration, and corporate disputes across startups and established companies.',
  'Cyber Law':
    'Works on cyber fraud cases, online harassment complaints, data privacy issues, and digital evidence review for investigation and trial.',
  'Immigration Law':
    'Guides clients on visa processing, work permit applications, residency pathways, and complete documentation for immigration approvals.',
  'Labour Law':
    'Assists in employment disputes, wrongful termination claims, workplace rights enforcement, and compensation recovery under labour statutes.',
  'Tax Law':
    'Provides counsel on tax filing, VAT obligations, audits, compliance planning, and business taxation for individuals and companies.',
};

const lawyerSeedSource = [
  {
    fullName: 'Aarav Shrestha',
    email: 'aarav.shrestha@lawlinkpro.demo',
    phone: '+977-9801000001',
    barLicenseNumber: 'NEP-LLP-001',
    yearsOfExperience: 6,
    officeLocation: 'Kathmandu',
    primarySpecialization: 'Family Law',
  },
  {
    fullName: 'Prisha Koirala',
    email: 'prisha.koirala@lawlinkpro.demo',
    phone: '+977-9801000002',
    barLicenseNumber: 'NEP-LLP-002',
    yearsOfExperience: 8,
    officeLocation: 'Pokhara',
    primarySpecialization: 'Family Law',
    secondarySpecialization: 'Criminal Law',
  },
  {
    fullName: 'Rohan Gautam',
    email: 'rohan.gautam@lawlinkpro.demo',
    phone: '+977-9801000003',
    barLicenseNumber: 'NEP-LLP-003',
    yearsOfExperience: 5,
    officeLocation: 'Lalitpur',
    primarySpecialization: 'Family Law',
    secondarySpecialization: 'Property Law',
  },
  {
    fullName: 'Nisha Adhikari',
    email: 'nisha.adhikari@lawlinkpro.demo',
    phone: '+977-9801000004',
    barLicenseNumber: 'NEP-LLP-004',
    yearsOfExperience: 9,
    officeLocation: 'Biratnagar',
    primarySpecialization: 'Criminal Law',
  },
  {
    fullName: 'Suman Bista',
    email: 'suman.bista@lawlinkpro.demo',
    phone: '+977-9801000005',
    barLicenseNumber: 'NEP-LLP-005',
    yearsOfExperience: 7,
    officeLocation: 'Butwal',
    primarySpecialization: 'Criminal Law',
    secondarySpecialization: 'Cyber Law',
  },
  {
    fullName: 'Maya KC',
    email: 'maya.kc@lawlinkpro.demo',
    phone: '+977-9801000006',
    barLicenseNumber: 'NEP-LLP-006',
    yearsOfExperience: 11,
    officeLocation: 'Nepalgunj',
    primarySpecialization: 'Criminal Law',
    secondarySpecialization: 'Labour Law',
  },
  {
    fullName: 'Kiran Thapa',
    email: 'kiran.thapa@lawlinkpro.demo',
    phone: '+977-9801000007',
    barLicenseNumber: 'NEP-LLP-007',
    yearsOfExperience: 10,
    officeLocation: 'Dharan',
    primarySpecialization: 'Property Law',
  },
  {
    fullName: 'Anjali Poudel',
    email: 'anjali.poudel@lawlinkpro.demo',
    phone: '+977-9801000008',
    barLicenseNumber: 'NEP-LLP-008',
    yearsOfExperience: 4,
    officeLocation: 'Hetauda',
    primarySpecialization: 'Property Law',
    secondarySpecialization: 'Family Law',
  },
  {
    fullName: 'Bikash Rana',
    email: 'bikash.rana@lawlinkpro.demo',
    phone: '+977-9801000009',
    barLicenseNumber: 'NEP-LLP-009',
    yearsOfExperience: 12,
    officeLocation: 'Bhaktapur',
    primarySpecialization: 'Property Law',
    secondarySpecialization: 'Corporate Law',
  },
  {
    fullName: 'Sneha Sharma',
    email: 'sneha.sharma@lawlinkpro.demo',
    phone: '+977-9801000010',
    barLicenseNumber: 'NEP-LLP-010',
    yearsOfExperience: 6,
    officeLocation: 'Chitwan',
    primarySpecialization: 'Corporate Law',
  },
  {
    fullName: 'Rajiv Neupane',
    email: 'rajiv.neupane@lawlinkpro.demo',
    phone: '+977-9801000011',
    barLicenseNumber: 'NEP-LLP-011',
    yearsOfExperience: 13,
    officeLocation: 'Kathmandu',
    primarySpecialization: 'Corporate Law',
    secondarySpecialization: 'Tax Law',
  },
  {
    fullName: 'Pooja Basnet',
    email: 'pooja.basnet@lawlinkpro.demo',
    phone: '+977-9801000012',
    barLicenseNumber: 'NEP-LLP-012',
    yearsOfExperience: 8,
    officeLocation: 'Pokhara',
    primarySpecialization: 'Corporate Law',
    secondarySpecialization: 'Immigration Law',
  },
  {
    fullName: 'Nabin Regmi',
    email: 'nabin.regmi@lawlinkpro.demo',
    phone: '+977-9801000013',
    barLicenseNumber: 'NEP-LLP-013',
    yearsOfExperience: 5,
    officeLocation: 'Birgunj',
    primarySpecialization: 'Cyber Law',
  },
  {
    fullName: 'Isha Acharya',
    email: 'isha.acharya@lawlinkpro.demo',
    phone: '+977-9801000014',
    barLicenseNumber: 'NEP-LLP-014',
    yearsOfExperience: 7,
    officeLocation: 'Lalitpur',
    primarySpecialization: 'Cyber Law',
    secondarySpecialization: 'Corporate Law',
  },
  {
    fullName: 'Sagar Lamichhane',
    email: 'sagar.lamichhane@lawlinkpro.demo',
    phone: '+977-9801000015',
    barLicenseNumber: 'NEP-LLP-015',
    yearsOfExperience: 9,
    officeLocation: 'Itahari',
    primarySpecialization: 'Immigration Law',
  },
  {
    fullName: 'Meera Bhandari',
    email: 'meera.bhandari@lawlinkpro.demo',
    phone: '+977-9801000016',
    barLicenseNumber: 'NEP-LLP-016',
    yearsOfExperience: 6,
    officeLocation: 'Janakpur',
    primarySpecialization: 'Immigration Law',
    secondarySpecialization: 'Family Law',
  },
  {
    fullName: 'Deepak Oli',
    email: 'deepak.oli@lawlinkpro.demo',
    phone: '+977-9801000017',
    barLicenseNumber: 'NEP-LLP-017',
    yearsOfExperience: 10,
    officeLocation: 'Butwal',
    primarySpecialization: 'Labour Law',
  },
  {
    fullName: 'Ritika Joshi',
    email: 'ritika.joshi@lawlinkpro.demo',
    phone: '+977-9801000018',
    barLicenseNumber: 'NEP-LLP-018',
    yearsOfExperience: 7,
    officeLocation: 'Dhangadhi',
    primarySpecialization: 'Labour Law',
    secondarySpecialization: 'Tax Law',
  },
  {
    fullName: 'Amit Dahal',
    email: 'amit.dahal@lawlinkpro.demo',
    phone: '+977-9801000019',
    barLicenseNumber: 'NEP-LLP-019',
    yearsOfExperience: 11,
    officeLocation: 'Kathmandu',
    primarySpecialization: 'Tax Law',
  },
  {
    fullName: 'Neha Aryal',
    email: 'neha.aryal@lawlinkpro.demo',
    phone: '+977-9801000020',
    barLicenseNumber: 'NEP-LLP-020',
    yearsOfExperience: 8,
    officeLocation: 'Pokhara',
    primarySpecialization: 'Tax Law',
    secondarySpecialization: 'Corporate Law',
  },
];

const seedLawyers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI is not set in environment variables.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    console.log('Hashing demo password...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const lawyers = lawyerSeedSource.map((lawyer) => {
      const specialization = [lawyer.primarySpecialization];

      if (lawyer.secondarySpecialization) {
        specialization.push(lawyer.secondarySpecialization);
      }

      const profileBio = bioBySpecialization[lawyer.primarySpecialization];

      return {
        fullName: lawyer.fullName,
        email: lawyer.email,
        phone: lawyer.phone,
        passwordHash,
        role: 'lawyer',
        lawyerProfile: {
          barLicenseNumber: lawyer.barLicenseNumber,
          yearsOfExperience: lawyer.yearsOfExperience,
          specialization,
          officeLocation: lawyer.officeLocation,
          bio: profileBio,
        },
      };
    });

    const invalidSpecs = lawyers.flatMap((lawyer) =>
      lawyer.lawyerProfile.specialization.filter(
        (spec) => !allowedSpecializations.includes(spec)
      )
    );

    if (invalidSpecs.length > 0) {
      throw new Error(`Invalid specialization(s) found: ${invalidSpecs.join(', ')}`);
    }

    console.log('Deleting existing lawyer users...');
    await User.deleteMany({ role: 'lawyer' });

    console.log('Inserting 20 lawyers...');
    await User.insertMany(lawyers);

    console.log(`Seed completed. Inserted ${lawyers.length} lawyers.`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit();
  }
};

seedLawyers();
