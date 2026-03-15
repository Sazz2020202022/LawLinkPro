import Case from '../models/Case.js';
import User from '../models/User.js';
import Request from '../models/Request.js';

// Simple tokenizer and stopwords
const stopwords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'will',
  'with',
]);

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));
};

const buildBigrams = (tokens) => {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
};

// Build term frequency for a document
const buildTermFrequency = (tokens) => {
  const tf = {};
  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
};

// Compute IDF for all terms across documents
const computeIDF = (documents) => {
  const idf = {};
  const N = documents.length;

  const allTerms = new Set();
  documents.forEach((doc) => {
    Object.keys(doc.tf).forEach((term) => allTerms.add(term));
  });

  allTerms.forEach((term) => {
    const docsWithTerm = documents.filter((doc) => doc.tf[term] > 0).length;
    idf[term] = Math.log(N / (docsWithTerm + 1));
  });

  return idf;
};

// Compute TF-IDF vector
const computeTFIDF = (tf, idf) => {
  const tfidf = {};
  Object.keys(tf).forEach((term) => {
    tfidf[term] = tf[term] * (idf[term] || 0);
  });
  return tfidf;
};

// Compute cosine similarity between two TF-IDF vectors
const cosineSimilarity = (vec1, vec2) => {
  const allTerms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  allTerms.forEach((term) => {
    const val1 = vec1[term] || 0;
    const val2 = vec2[term] || 0;

    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;

  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

const getTopOverlapKeywords = (caseTokens, lawyerTokens, caseTF, lawyerTF, count = 5) => {
  const caseTokenSet = new Set(caseTokens);
  const lawyerTokenSet = new Set(lawyerTokens);

  const unigramOverlap = [...caseTokenSet].filter((token) => lawyerTokenSet.has(token));

  const caseBigrams = buildBigrams(caseTokens);
  const lawyerBigrams = new Set(buildBigrams(lawyerTokens));
  const bigramOverlap = [...new Set(caseBigrams)].filter((phrase) => lawyerBigrams.has(phrase));

  const scored = [
    ...bigramOverlap.map((phrase) => ({
      keyword: phrase,
      score: 100,
    })),
    ...unigramOverlap.map((token) => ({
      keyword: token,
      score: (caseTF[token] || 0) + (lawyerTF[token] || 0),
    })),
  ];

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item) => item.keyword)
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, count);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getProfileCompleteness = (lawyerProfile) => {
  const checks = [
    Boolean(lawyerProfile?.barLicenseNumber),
    Number.isFinite(lawyerProfile?.yearsOfExperience),
    Array.isArray(lawyerProfile?.specialization) && lawyerProfile.specialization.length > 0,
    Boolean(lawyerProfile?.officeLocation),
    Boolean(lawyerProfile?.bio),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const getAvailabilityScore = (availability) => {
  if (availability === 'available') return 100;
  if (availability === 'busy') return 65;
  return 35;
};

const normalizeCaseTitle = (title = '') => {
  return String(title)
    .replace(/^\s*\[(demo|sample|test)[^\]]*\]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeCaseNotes = (notes = '') => {
  return String(notes)
    .replace(/\bfor demo purposes\b\.?/gi, '')
    .replace(/\bdemo\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const normalizeCaseStatus = (status = '') => {
  const map = {
    request_sent: 'Request Sent',
    in_progress: 'In Progress',
    completed: 'Completed',
    accepted: 'Accepted',
    submitted: 'Submitted',
  };

  return map[status] || 'Active';
};

const buildHistoryByLawyer = (requests) => {
  const historyMap = {};

  requests.forEach((request) => {
    const lawyerId = request?.lawyer?.toString();
    if (!lawyerId) return;

    if (!historyMap[lawyerId]) {
      historyMap[lawyerId] = {
        requestsReceived: 0,
        casesTaken: 0,
        casesWon: 0,
        activeCases: 0,
        rejectedCases: 0,
        acceptedWithCase: 0,
        responseDurationsMs: [],
        categoryCounts: {},
        recentCaseHighlights: [],
        wonCaseHighlights: [],
      };
    }

    const history = historyMap[lawyerId];
    const caseStatus = request?.case?.status;
    const caseCategory = request?.case?.category;

    history.requestsReceived += 1;

    if (request?.status === 'accepted') {
      history.casesTaken += 1;

      const caseRecord = {
        title: normalizeCaseTitle(request?.case?.title || 'Case'),
        category: caseCategory || 'General',
        description: request?.case?.description || 'No case description available.',
        researchNotes: normalizeCaseNotes(request?.case?.additionalNotes || ''),
        aiSummary: request?.case?.aiSummary || '',
        status: normalizeCaseStatus(caseStatus),
        acceptedAt: request?.acceptedAt || request?.createdAt,
      };

      if (caseStatus) {
        history.acceptedWithCase += 1;
      }

      if (caseStatus === 'completed') {
        history.casesWon += 1;
        history.wonCaseHighlights.push(caseRecord);
      }

      if (caseStatus === 'accepted' || caseStatus === 'in_progress' || caseStatus === 'request_sent') {
        history.activeCases += 1;
      }

      if (caseCategory) {
        history.categoryCounts[caseCategory] = (history.categoryCounts[caseCategory] || 0) + 1;
      }

      history.recentCaseHighlights.push(caseRecord);
    }

    if (request?.status === 'rejected') {
      history.rejectedCases += 1;
    }

    if (request?.respondedAt && request?.createdAt) {
      const duration = new Date(request.respondedAt).getTime() - new Date(request.createdAt).getTime();
      if (Number.isFinite(duration) && duration > 0) {
        history.responseDurationsMs.push(duration);
      }
    }
  });

  Object.values(historyMap).forEach((history) => {
    history.acceptanceRate = history.requestsReceived
      ? Math.round((history.casesTaken / history.requestsReceived) * 100)
      : 0;

    history.completionRate = history.acceptedWithCase
      ? Math.round((history.casesWon / history.acceptedWithCase) * 100)
      : 0;

    const avgResponseMs = history.responseDurationsMs.length
      ? history.responseDurationsMs.reduce((sum, value) => sum + value, 0) / history.responseDurationsMs.length
      : 0;

    history.avgResponseHours = avgResponseMs ? Number((avgResponseMs / (1000 * 60 * 60)).toFixed(1)) : null;
    history.topCategories = Object.entries(history.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    history.recentCaseHighlights = history.recentCaseHighlights
      .sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime())
      .slice(0, 8);

    history.wonCaseHighlights = history.wonCaseHighlights.sort(
      (a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime()
    ).slice(0, 8);

    delete history.categoryCounts;
    delete history.responseDurationsMs;
    delete history.acceptedWithCase;
  });

  return historyMap;
};

const buildExplainableBreakdown = ({
  score,
  topKeywords,
  yearsOfExperience,
  availability,
  profileCompleteness,
  history,
}) => {
  const similarityScore = clamp(Math.round(score * 100), 0, 100);
  const keywordCoverage = clamp(Math.round(((topKeywords?.length || 0) / 5) * 100), 0, 100);
  const experienceScore = clamp(Math.round((Math.min(yearsOfExperience, 25) / 25) * 100), 0, 100);
  const availabilityScore = getAvailabilityScore(availability);

  const historyScore = clamp(
    Math.round(
      (history.acceptanceRate || 0) * 0.35 +
        (history.completionRate || 0) * 0.45 +
        (Math.min(history.casesTaken || 0, 40) / 40) * 100 * 0.2
    ),
    0,
    100
  );

  const weights = {
    similarity: 0.43,
    history: 0.22,
    profile: 0.14,
    experience: 0.13,
    availability: 0.08,
  };

  const factors = [
    {
      key: 'similarity',
      label: 'Case & profile relevance',
      value: similarityScore,
      weight: weights.similarity,
      reason: `Keyword overlap score ${keywordCoverage}% from: ${(topKeywords || []).slice(0, 3).join(', ') || 'limited overlap'}.`,
    },
    {
      key: 'history',
      label: 'Case history performance',
      value: historyScore,
      weight: weights.history,
      reason: `${history.casesWon || 0} completed outcomes from ${history.casesTaken || 0} accepted cases (${history.completionRate || 0}% completion).`,
    },
    {
      key: 'profile',
      label: 'Profile completeness',
      value: profileCompleteness,
      weight: weights.profile,
      reason: `Professional profile completeness is ${profileCompleteness}% based on specialization, bio, location, experience, and verification details.`,
    },
    {
      key: 'experience',
      label: 'Practice experience fit',
      value: experienceScore,
      weight: weights.experience,
      reason: `${yearsOfExperience} years in practice contributes to readiness for complex matters.`,
    },
    {
      key: 'availability',
      label: 'Current availability',
      value: availabilityScore,
      weight: weights.availability,
      reason:
        availability === 'available'
          ? 'Currently available for new cases.'
          : availability === 'busy'
            ? 'Has active load but remains open to suitable cases.'
            : 'On leave and less likely to engage immediately.',
    },
  ].map((factor) => ({
    ...factor,
    contribution: Math.round(factor.value * factor.weight),
  }));

  const matchPercent = clamp(
    factors.reduce((sum, factor) => sum + factor.contribution, 0),
    0,
    99
  );

  return {
    matchPercent,
    factors,
    summary: `Matched ${matchPercent}% using relevance, historical outcomes, profile depth, and current availability.`,
  };
};

export const getRecommendations = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findOne({ _id: caseId, client: req.user.id });

    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const lawyers = await User.find({ role: 'lawyer' }).select('fullName email phone lawyerProfile').lean();

    if (lawyers.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const lawyerIds = lawyers.map((lawyer) => lawyer._id);
    const allRequests = await Request.find({ lawyer: { $in: lawyerIds } })
      .select('lawyer case status createdAt respondedAt acceptedAt')
      .populate({ path: 'case', select: 'title category description additionalNotes aiSummary status' })
      .lean();

    const historyByLawyer = buildHistoryByLawyer(allRequests);

    // Build case text corpus
    const caseText = `${caseDoc.title} ${caseDoc.category} ${caseDoc.description}`;
    const caseTokens = tokenize(caseText);
    const caseTF = buildTermFrequency(caseTokens);

    // Build lawyer text corpus
    const lawyerDocs = lawyers.map((lawyer) => {
      const specialization = Array.isArray(lawyer.lawyerProfile?.specialization)
        ? lawyer.lawyerProfile.specialization.join(' ')
        : '';
      const bio = lawyer.lawyerProfile?.bio || '';
      const location = lawyer.lawyerProfile?.officeLocation || '';
      const years = lawyer.lawyerProfile?.yearsOfExperience || 0;

      const lawyerText = `${specialization} ${bio} ${location} ${years} years`;
      const tokens = tokenize(lawyerText);
      const tf = buildTermFrequency(tokens);

      return {
        lawyer,
        tokens,
        tf,
      };
    });

    // Compute IDF across all documents (case + lawyers)
    const allDocs = [{ tf: caseTF }, ...lawyerDocs];
    const idf = computeIDF(allDocs);

    // Compute TF-IDF for case
    const caseTFIDF = computeTFIDF(caseTF, idf);

    // Compute similarity for each lawyer
    const recommendations = lawyerDocs.map((doc) => {
      const lawyerTFIDF = computeTFIDF(doc.tf, idf);
      const score = cosineSimilarity(caseTFIDF, lawyerTFIDF);
      const topKeywords = getTopOverlapKeywords(caseTokens, doc.tokens, caseTF, doc.tf, 5);
      const profileCompleteness = getProfileCompleteness(doc.lawyer.lawyerProfile);

      const history =
        historyByLawyer[doc.lawyer._id.toString()] || {
          requestsReceived: 0,
          casesTaken: 0,
          casesWon: 0,
          activeCases: 0,
          rejectedCases: 0,
          acceptanceRate: 0,
          completionRate: 0,
          avgResponseHours: null,
          topCategories: [],
          recentCaseHighlights: [],
          wonCaseHighlights: [],
        };

      const explainability = buildExplainableBreakdown({
        score,
        topKeywords,
        yearsOfExperience: doc.lawyer.lawyerProfile?.yearsOfExperience || 0,
        availability: doc.lawyer.lawyerProfile?.availability || 'available',
        profileCompleteness,
        history,
      });

      const deterministicSeed = parseInt(doc.lawyer._id.toString().slice(-4), 16) || 0;
      const rating = Number((4 + (deterministicSeed % 11) / 10).toFixed(1));

      return {
        lawyerId: doc.lawyer._id.toString(),
        fullName: doc.lawyer.fullName,
        email: doc.lawyer.email || '',
        phone: doc.lawyer.phone || '',
        specialization: doc.lawyer.lawyerProfile?.specialization || [],
        officeLocation: doc.lawyer.lawyerProfile?.officeLocation || 'Not specified',
        yearsOfExperience: doc.lawyer.lawyerProfile?.yearsOfExperience || 0,
        availability: doc.lawyer.lawyerProfile?.availability || 'available',
        rating,
        score,
        matchPercent: explainability.matchPercent,
        topKeywords,
        profileCompleteness,
        history,
        explainability,
      };
    });

    // Sort by score descending and take top 10
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 10);

    return res.status(200).json({ recommendations: topRecommendations });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Case not found' });
    }

    console.error('Get recommendations error:', error);
    return res.status(500).json({ message: 'Unable to fetch recommendations right now' });
  }
};
