import { ComplaintCategory } from './classifier';

export function routeToDepartment(category: ComplaintCategory): string {
  switch (category) {
    case 'Streetlight/Electrical':
      return 'Electrical Maintenance';
    case 'Pothole/Road':
      return 'Roads & Infrastructure';
    case 'Water Leakage':
      return 'Water Supply & Plumbing';
    case 'Garbage/Sanitation':
      return 'Sanitation & Waste Management';
    case 'Drainage':
      return 'Drainage & Sewerage';
    case 'Infrastructure Damage':
      return 'Campus Facilities';
    case 'Other':
    default:
      return 'General Administration';
  }
}
