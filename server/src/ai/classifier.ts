export type ComplaintCategory =
  | 'Streetlight/Electrical'
  | 'Pothole/Road'
  | 'Water Leakage'
  | 'Garbage/Sanitation'
  | 'Drainage'
  | 'Infrastructure Damage'
  | 'Other';

export function classifyCategoryRuleBased(text: string): ComplaintCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes('light') ||
    lower.includes('lamp') ||
    lower.includes('wire') ||
    lower.includes('electric') ||
    lower.includes('spark') ||
    lower.includes('power') ||
    lower.includes('hostel light') ||
    lower.includes('மின்சாரம்') ||
    lower.includes('விளக்கு')
  ) {
    return 'Streetlight/Electrical';
  }

  if (
    lower.includes('pothole') ||
    lower.includes('road') ||
    lower.includes('asphalt') ||
    lower.includes('crack') ||
    lower.includes('tar') ||
    lower.includes('சாக்கடை') ||
    lower.includes('சாலை')
  ) {
    return 'Pothole/Road';
  }

  if (
    lower.includes('pipe') ||
    lower.includes('water') ||
    lower.includes('leak') ||
    lower.includes('burst') ||
    lower.includes('tap') ||
    lower.includes('supply') ||
    lower.includes('நீர்') ||
    lower.includes('குடிநீர்')
  ) {
    return 'Water Leakage';
  }

  if (
    lower.includes('garbage') ||
    lower.includes('trash') ||
    lower.includes('waste') ||
    lower.includes('bins') ||
    lower.includes('smell') ||
    lower.includes('clean') ||
    lower.includes('குப்பை')
  ) {
    return 'Garbage/Sanitation';
  }

  if (
    lower.includes('drain') ||
    lower.includes('sewage') ||
    lower.includes('overflow') ||
    lower.includes('gutter') ||
    lower.includes('clog') ||
    lower.includes('கழிவுநீர்')
  ) {
    return 'Drainage';
  }

  if (
    lower.includes('wall') ||
    lower.includes('bench') ||
    lower.includes('gate') ||
    lower.includes('building') ||
    lower.includes('bridge') ||
    lower.includes('structure') ||
    lower.includes('broken bench')
  ) {
    return 'Infrastructure Damage';
  }

  return 'Other';
}
