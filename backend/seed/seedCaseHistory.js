import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Case from '../models/Case.js';
import Request from '../models/Request.js';

dotenv.config();

const DEMO_CASE_PREFIX = '[Demo Research]';

const specializationScenarioMap = {
  'Family Law': [
    {
      title: 'Child Custody & Visitation Plan Review',
      category: 'Family Law',
      description:
        'Client seeks a structured parenting schedule after separation. Existing informal arrangement leads to frequent conflict around weekends, school holidays, and healthcare decision rights.',
      additionalNotes:
        'Includes mediation transcripts, school attendance records, and communication logs for the last 8 months.',
      urgency: 'high',
      budgetRange: '$1200-$2500',
    },
    {
      title: 'Mutual Divorce Settlement Drafting',
      category: 'Family Law',
      description:
        'Client needs legal drafting and representation for mutual consent divorce with clear settlement terms for assets, alimony, and post-divorce obligations.',
      additionalNotes:
        'Property papers and joint account statements already compiled. Requires timeline-driven filing plan.',
      urgency: 'medium',
      budgetRange: '$900-$1800',
    },
  ],
  'Criminal Law': [
    {
      title: 'Bail Strategy and Evidence Review',
      category: 'Criminal Law',
      description:
        'Client requires immediate bail support and legal strategy after FIR registration. Matter includes CCTV evidence, witness contradictions, and disputed timeline details.',
      additionalNotes:
        'Forensic and digital evidence index prepared. Needs hearing strategy for first two court dates.',
      urgency: 'urgent',
      budgetRange: '$1800-$3500',
    },
    {
      title: 'Trial Defense Preparation',
      category: 'Criminal Law',
      description:
        'Client seeks full defense preparation for upcoming trial phase, including charge review, witness cross plan, and legal precedent mapping.',
      additionalNotes:
        'Case bundle includes prior orders, police report, and two independent expert opinions.',
      urgency: 'high',
      budgetRange: '$2500-$5000',
    },
  ],
  'Property Law': [
    {
      title: 'Land Title Dispute Resolution',
      category: 'Property Law',
      description:
        'Client faces title conflict after legacy transfer. Requires mutation verification, ownership chain reconstruction, and civil filing strategy.',
      additionalNotes:
        'Survey maps, municipality records, and transfer deeds available for legal review.',
      urgency: 'high',
      budgetRange: '$1300-$2800',
    },
    {
      title: 'Commercial Lease Breach Claim',
      category: 'Property Law',
      description:
        'Client seeks remedy for lease breach involving delayed possession, maintenance non-compliance, and financial damages.',
      additionalNotes:
        'Contains lease agreement, notice trail, and estimated loss worksheet for quantification.',
      urgency: 'medium',
      budgetRange: '$1100-$2400',
    },
  ],
  'Corporate Law': [
    {
      title: 'Shareholder Agreement Conflict',
      category: 'Corporate Law',
      description:
        'Client needs representation in shareholder dispute regarding voting rights dilution, board authority, and financial disclosure non-compliance.',
      additionalNotes:
        'Cap table, board minutes, and investor communication records attached for legal strategy.',
      urgency: 'high',
      budgetRange: '$2200-$4500',
    },
    {
      title: 'Vendor Contract Risk Review',
      category: 'Corporate Law',
      description:
        'Client requests legal review of high-value vendor contract focused on liability, indemnity, termination, and dispute resolution clauses.',
      additionalNotes:
        'Contract redlines required with fallback clauses and jurisdiction-safe dispute mechanism.',
      urgency: 'medium',
      budgetRange: '$1000-$2000',
    },
  ],
  'Cyber Law': [
    {
      title: 'Online Fraud Complaint & Recovery',
      category: 'Cyber Law',
      description:
        'Client lost funds through social engineering fraud and requires legal support for complaint escalation, account freeze requests, and evidence packaging.',
      additionalNotes:
        'Transaction IDs, communication trails, and incident timeline prepared for filing.',
      urgency: 'urgent',
      budgetRange: '$1400-$3000',
    },
    {
      title: 'Data Privacy Breach Advisory',
      category: 'Cyber Law',
      description:
        'Client company needs legal assessment after internal data exposure, including notification duties, policy gaps, and remediation safeguards.',
      additionalNotes:
        'Breach impact matrix and internal incident report included for legal compliance response.',
      urgency: 'high',
      budgetRange: '$2000-$4200',
    },
  ],
  'Immigration Law': [
    {
      title: 'Work Visa Rejection Appeal',
      category: 'Immigration Law',
      description:
        'Client seeks structured appeal after visa refusal citing incomplete documentation and financial sufficiency concerns.',
      additionalNotes:
        'Prior filings, refusal letter, and revised document checklist available for submission plan.',
      urgency: 'high',
      budgetRange: '$1600-$3200',
    },
    {
      title: 'Residency Pathway Documentation',
      category: 'Immigration Law',
      description:
        'Client needs end-to-end legal support on residency route selection, timeline management, and dependent documentation.',
      additionalNotes:
        'Timeline constraints linked to expiring permit and dependent school enrollment deadlines.',
      urgency: 'medium',
      budgetRange: '$1300-$2600',
    },
  ],
  'Labour Law': [
    {
      title: 'Wrongful Termination Compensation Claim',
      category: 'Labour Law',
      description:
        'Client was terminated without due process and needs legal support for notice compliance review, reinstatement feasibility, and compensation calculation.',
      additionalNotes:
        'Employment contract, appraisal records, and HR notices provided for case construction.',
      urgency: 'high',
      budgetRange: '$1200-$2400',
    },
    {
      title: 'Workplace Harassment Proceedings',
      category: 'Labour Law',
      description:
        'Client seeks formal legal route for workplace harassment complaint with evidence strategy and representation before labor authorities.',
      additionalNotes:
        'Incident timeline, witness notes, and policy excerpts included for legal filing draft.',
      urgency: 'high',
      budgetRange: '$1500-$3000',
    },
  ],
  'Tax Law': [
    {
      title: 'Tax Audit Defense Planning',
      category: 'Tax Law',
      description:
        'Client requires legal strategy for ongoing tax audit involving expense disallowance and penalties risk across prior financial years.',
      additionalNotes:
        'Audit notice, books extracts, and accountant analysis compiled for hearing preparation.',
      urgency: 'high',
      budgetRange: '$1800-$3800',
    },
    {
      title: 'VAT Compliance Dispute',
      category: 'Tax Law',
      description:
        'Client seeks legal remedy for VAT mismatch notice and delayed input credit recognition across multiple invoices.',
      additionalNotes:
        'Invoice reconciliation and correspondence with tax office prepared for representation.',
      urgency: 'medium',
      budgetRange: '$1100-$2300',
    },
  ],
};

const clientSeedSource = [
  {
    fullName: 'Riya Sharma',
    email: 'riya.sharma.client@lawlinkpro.demo',
    phone: '+977-9811100001',
    location: 'Kathmandu',
  },
  {
    fullName: 'Aashish Gurung',
    email: 'aashish.gurung.client@lawlinkpro.demo',
    phone: '+977-9811100002',
    location: 'Pokhara',
  },
  {
    fullName: 'Kabita Rai',
    email: 'kabita.rai.client@lawlinkpro.demo',
    phone: '+977-9811100003',
    location: 'Lalitpur',
  },
  {
    fullName: 'Ramesh Karki',
    email: 'ramesh.karki.client@lawlinkpro.demo',
    phone: '+977-9811100004',
    location: 'Biratnagar',
  },
  {
    fullName: 'Nirmala Thapa',
    email: 'nirmala.thapa.client@lawlinkpro.demo',
    phone: '+977-9811100005',
    location: 'Butwal',
  },
  {
    fullName: 'Pratiksha KC',
    email: 'pratiksha.kc.client@lawlinkpro.demo',
    phone: '+977-9811100006',
    location: 'Bhaktapur',
  },
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const pickScenario = (specialization, offset = 0) => {
  const scenarios = specializationScenarioMap[specialization] || specializationScenarioMap['Corporate Law'];
  return scenarios[offset % scenarios.length];
};

const createCasePayload = ({ lawyer, client, sequence, status }) => {
  const primarySpecialization = lawyer.lawyerProfile?.specialization?.[0] || 'Corporate Law';
  const scenario = pickScenario(primarySpecialization, sequence);
  const enrichedDescription = `${scenario.description} Detailed research scope includes statutory interpretation, precedent analysis, procedural risk identification, and hearing-stage action plan.`;
  const enrichedNotes = `${scenario.additionalNotes} Research depth: statute review, precedent mapping, risk matrix, and action milestones included. Evidence checklist and timeline matrix are attached for counsel review.`;

  return {
    client: client._id,
    title: `${DEMO_CASE_PREFIX} ${scenario.title} #${sequence + 1}`,
    category: scenario.category,
    description: enrichedDescription,
    urgency: scenario.urgency,
    location: client.clientProfile?.location || lawyer.lawyerProfile?.officeLocation || 'Kathmandu',
    budgetRange: scenario.budgetRange,
    opposingParty: 'Institutional or private respondent as per filing records',
    preferredContactTime: 'Afternoon',
    additionalNotes: enrichedNotes,
    status,
    aiSummary: `Detailed legal research indicates this matter aligns with ${primarySpecialization} strategy, has moderate-to-high litigation complexity, and requires evidence-first representation with phased negotiation fallback.`,
    createdAt: daysAgo(90 - sequence * 4),
    updatedAt: daysAgo(89 - sequence * 4),
  };
};

const createRequestPayload = ({ caseDoc, lawyer, client, status, sequence }) => {
  const createdAt = daysAgo(88 - sequence * 4);
  const base = {
    client: client._id,
    lawyer: lawyer._id,
    case: caseDoc._id,
    status,
    message: `Request for ${caseDoc.category} matter with detailed case research and strategic notes.`,
    latestMessageAt: daysAgo(86 - sequence * 4),
    createdAt,
    updatedAt: daysAgo(84 - sequence * 4),
  };

  if (status === 'accepted') {
    base.respondedAt = daysAgo(87 - sequence * 4);
    base.acceptedAt = daysAgo(87 - sequence * 4);
  }

  if (status === 'rejected') {
    base.respondedAt = daysAgo(87 - sequence * 4);
  }

  return base;
};

const seedCaseHistory = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI is not set in environment variables.');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    const lawyers = await User.find({ role: 'lawyer' }).select('fullName lawyerProfile').lean();

    if (lawyers.length === 0) {
      throw new Error('No lawyers found. Please run seedLawyers.js first.');
    }

    console.log('Preparing demo clients...');
    const passwordHash = await bcrypt.hash('password123', 10);

    for (const client of clientSeedSource) {
      await User.updateOne(
        { email: client.email },
        {
          $set: {
            fullName: client.fullName,
            phone: client.phone,
            passwordHash,
            role: 'client',
            clientProfile: {
              location: client.location,
              preferredLanguage: 'English',
                bio: 'Client profile used for case matching and recommendation quality checks.',
            },
          },
        },
        { upsert: true }
      );
    }

    const demoClients = await User.find({
      role: 'client',
      email: { $in: clientSeedSource.map((item) => item.email) },
    }).select('fullName clientProfile').lean();

    const previousDemoCases = await Case.find({ title: { $regex: `^\\${DEMO_CASE_PREFIX}` } }).select('_id').lean();
    const previousDemoCaseIds = previousDemoCases.map((item) => item._id);

    if (previousDemoCaseIds.length > 0) {
      console.log(`Cleaning ${previousDemoCaseIds.length} existing demo cases and related requests...`);
      await Request.deleteMany({ case: { $in: previousDemoCaseIds } });
      await Case.deleteMany({ _id: { $in: previousDemoCaseIds } });
    }

    const casesToInsert = [];
    const requestsToInsert = [];

    lawyers.forEach((lawyer, lawyerIndex) => {
      const acceptedCount = 4 + (lawyerIndex % 4);
      const pendingCount = 1;
      const rejectedCount = lawyerIndex % 3 === 0 ? 1 : 0;
      const totalForLawyer = acceptedCount + pendingCount + rejectedCount;

      for (let i = 0; i < totalForLawyer; i += 1) {
        const client = demoClients[(lawyerIndex + i) % demoClients.length];

        let requestStatus = 'pending';
        let caseStatus = 'request_sent';

        if (i < acceptedCount) {
          requestStatus = 'accepted';

          // Weighted toward completed outcomes so clients can see richer won-case history.
          if (i % 2 === 0) {
            caseStatus = 'completed';
          } else if (i % 3 === 1) {
            caseStatus = 'in_progress';
          } else {
            caseStatus = 'accepted';
          }
        } else if (i >= acceptedCount + pendingCount) {
          requestStatus = 'rejected';
          caseStatus = 'submitted';
        }

        casesToInsert.push(
          createCasePayload({
            lawyer,
            client,
            sequence: lawyerIndex * 10 + i,
            status: caseStatus,
          })
        );

        requestsToInsert.push({
          lawyerId: lawyer._id,
          clientId: client._id,
          requestStatus,
          sequence: lawyerIndex * 10 + i,
        });
      }
    });

    console.log(`Inserting ${casesToInsert.length} demo researched cases...`);
    const insertedCases = await Case.insertMany(casesToInsert);

    const requestDocs = requestsToInsert.map((item, index) => {
      const caseDoc = insertedCases[index];
      const lawyer = { _id: item.lawyerId };
      const client = { _id: item.clientId };

      return createRequestPayload({
        caseDoc,
        lawyer,
        client,
        status: item.requestStatus,
        sequence: item.sequence,
      });
    });

    console.log(`Inserting ${requestDocs.length} demo request histories...`);
    await Request.insertMany(requestDocs);

    const completedCases = await Case.countDocuments({ title: { $regex: `^\\${DEMO_CASE_PREFIX}` }, status: 'completed' });
    const inProgressCases = await Case.countDocuments({ title: { $regex: `^\\${DEMO_CASE_PREFIX}` }, status: 'in_progress' });

    console.log('Demo case history seed completed.');
    console.log(`Lawyers covered: ${lawyers.length}`);
    console.log(`Clients used: ${demoClients.length}`);
    console.log(`Completed (won) demo cases: ${completedCases}`);
    console.log(`In-progress demo cases: ${inProgressCases}`);
  } catch (error) {
    console.error('Case history seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit();
  }
};

seedCaseHistory();
