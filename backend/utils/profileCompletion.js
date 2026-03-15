export const getClientProfileCompletion = (user) => {
  const missingFields = [];

  const hasPhone = Boolean(user?.phone && String(user.phone).trim());
  const hasLocation = Boolean(user?.clientProfile?.location && String(user.clientProfile.location).trim());
  const hasPreferredLanguage = Boolean(
    user?.clientProfile?.preferredLanguage && String(user.clientProfile.preferredLanguage).trim()
  );
  const hasBio = Boolean(user?.clientProfile?.bio && String(user.clientProfile.bio).trim());

  if (!hasPhone) {
    missingFields.push('phone');
  }
  if (!hasLocation) {
    missingFields.push('location');
  }
  if (!hasPreferredLanguage) {
    missingFields.push('preferredLanguage');
  }
  if (!hasBio) {
    missingFields.push('bio');
  }

  const scoreWeights = {
    phone: 25,
    location: 30,
    preferredLanguage: 25,
    bio: 20,
  };

  const profileCompletion =
    (hasPhone ? scoreWeights.phone : 0) +
    (hasLocation ? scoreWeights.location : 0) +
    (hasPreferredLanguage ? scoreWeights.preferredLanguage : 0) +
    (hasBio ? scoreWeights.bio : 0);

  return {
    profileCompletion,
    isProfileComplete: missingFields.length === 0,
    missingFields,
  };
};
