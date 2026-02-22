import Case from '../models/Case.js';
import User from '../models/User.js';

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

// Get top keywords from TF-IDF vector
const getTopKeywords = (tfidf, count = 3) => {
  return Object.entries(tfidf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map((entry) => entry[0]);
};

export const getRecommendations = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findOne({ _id: caseId, client: req.user.id });

    if (!caseDoc) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const lawyers = await User.find({ role: 'lawyer' }).select('fullName lawyerProfile').lean();

    if (lawyers.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

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
      const matchPercent = Math.round(score * 100);
      const topKeywords = getTopKeywords(lawyerTFIDF, 3);

      const deterministicSeed = parseInt(doc.lawyer._id.toString().slice(-4), 16) || 0;
      const rating = Number((4 + (deterministicSeed % 11) / 10).toFixed(1));

      return {
        lawyerId: doc.lawyer._id.toString(),
        fullName: doc.lawyer.fullName,
        specialization: doc.lawyer.lawyerProfile?.specialization || [],
        officeLocation: doc.lawyer.lawyerProfile?.officeLocation || 'Not specified',
        yearsOfExperience: doc.lawyer.lawyerProfile?.yearsOfExperience || 0,
        rating,
        score,
        matchPercent,
        topKeywords,
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
