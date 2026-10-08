// Haversine distance in meters
export function calculateGeoDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Jaccard text similarity score between 0 and 1
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokenize = (str: string) =>
    new Set(
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  set1.forEach((word) => {
    if (set2.has(word)) intersection++;
  });

  const union = set1.size + set2.size - intersection;
  return intersection / union;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarityScore: number; // 0 - 100
  matchedComplaintId?: string;
  reason?: string;
}

export function evaluateDuplicate(
  newComplaint: { category: string; lat: number; lng: number; description: string; title: string },
  existingComplaints: Array<{
    id: string;
    category: string;
    lat: number;
    lng: number;
    description: string;
    title: string;
    incidentId?: string | null;
  }>
): DuplicateCheckResult {
  let highestScore = 0;
  let bestMatch: (typeof existingComplaints)[0] | null = null;
  let matchReason = '';

  for (const existing of existingComplaints) {
    if (existing.category !== newComplaint.category) continue;

    const distance = calculateGeoDistanceMeters(
      newComplaint.lat,
      newComplaint.lng,
      existing.lat,
      existing.lng
    );

    // If within ~150 meters radius
    if (distance <= 150) {
      const titleSim = calculateTextSimilarity(newComplaint.title, existing.title);
      const descSim = calculateTextSimilarity(newComplaint.description, existing.description);
      const avgSim = titleSim * 0.4 + descSim * 0.6;

      // Distance score: 100% at 0m, decaying to 50% at 150m
      const geoScore = Math.max(0, 100 - (distance / 150) * 50);

      // Total similarity score combining location and text semantics
      const combinedScore = Math.round(geoScore * 0.5 + avgSim * 100 * 0.5);

      if (combinedScore > highestScore) {
        highestScore = combinedScore;
        bestMatch = existing;
        matchReason = `Located ${Math.round(distance)}m away with ${Math.round(
          avgSim * 100
        )}% text similarity in same category (${newComplaint.category})`;
      }
    }
  }

  const isDuplicate = highestScore >= 60 && bestMatch !== null;

  return {
    isDuplicate,
    similarityScore: highestScore,
    matchedComplaintId: bestMatch?.id,
    reason: isDuplicate ? matchReason : 'Unique issue; no close duplicates found',
  };
}
