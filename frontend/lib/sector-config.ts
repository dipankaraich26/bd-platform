// ─── SECTOR CONFIGURATION ────────────────────────────────────────────────────

export type Sector = 'DEFENCE' | 'MEDICAL' | 'AUTOMOTIVE' | 'CLIMATE_CONTROL' | 'ELECTRONICS' | 'TECHNOLOGY' | 'OTHER';

export const SECTORS: { value: Sector; label: string; color: string; bg: string; icon: string }[] = [
  { value: 'DEFENCE',         label: 'Defence',         color: 'text-red-700',     bg: 'bg-red-50 border-red-200',       icon: '🛡️' },
  { value: 'MEDICAL',         label: 'Medical',         color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '🏥' },
  { value: 'AUTOMOTIVE',      label: 'Automotive',      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     icon: '🚗' },
  { value: 'CLIMATE_CONTROL', label: 'Climate Control', color: 'text-cyan-700',    bg: 'bg-cyan-50 border-cyan-200',     icon: '❄️' },
  { value: 'ELECTRONICS',     label: 'Electronics',     color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200', icon: '⚡' },
  { value: 'TECHNOLOGY',      label: 'Technology',      color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', icon: '💻' },
  { value: 'OTHER',           label: 'Other',           color: 'text-gray-700',    bg: 'bg-gray-50 border-gray-200',     icon: '📁' },
];

export const SECTOR_CATEGORIES: Record<Sector, string[]> = {
  DEFENCE: [
    'GENERAL', 'RADAR', 'DRONE', 'EW_SYSTEMS', 'OPTRONICS', 'COMMUNICATIONS',
    'CYBER', 'UNMANNED_SYSTEMS', 'MISSILES', 'ARTILLERY', 'NIGHT_VISION', 'POWERTRAIN',
  ],
  MEDICAL: [
    'GENERAL', 'RESPIRATORY', 'ANAESTHESIA', 'CARDIOLOGY', 'DIAGNOSTICS',
    'SURGICAL', 'IMAGING', 'REHABILITATION', 'MONITORING', 'DENTAL', 'OPHTHALMOLOGY',
  ],
  AUTOMOTIVE: [
    'GENERAL', 'POWERTRAIN', 'ADAS', 'INFOTAINMENT', 'BODY_ELECTRONICS',
    'CHASSIS', 'HVAC_AUTO', 'SAFETY_SYSTEMS', 'EV_SYSTEMS', 'TELEMATICS',
  ],
  CLIMATE_CONTROL: [
    'GENERAL', 'RESIDENTIAL_AC', 'COMMERCIAL_AC', 'INDUSTRIAL_AC',
    'CHILLER', 'VRF_SYSTEM', 'HEAT_PUMP', 'VENTILATION', 'REFRIGERATION',
  ],
  ELECTRONICS: [
    'GENERAL', 'PCB_DESIGN', 'EMBEDDED_SYSTEMS', 'POWER_ELECTRONICS',
    'RF_MICROWAVE', 'SEMICONDUCTOR', 'SENSORS', 'DISPLAYS', 'CONNECTIVITY',
  ],
  TECHNOLOGY: [
    'GENERAL', 'SOFTWARE_DEV', 'AI_ML', 'CLOUD', 'CYBERSECURITY',
    'IOT', 'DATA_ANALYTICS', 'MOBILE_APP', 'ENTERPRISE_IT',
  ],
  OTHER: ['GENERAL'],
};

export const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General', RADAR: 'Radar', DRONE: 'Drone / UAV', EW_SYSTEMS: 'EW Systems',
  OPTRONICS: 'Optronics', COMMUNICATIONS: 'Communications', CYBER: 'Cyber',
  UNMANNED_SYSTEMS: 'Unmanned Systems', MISSILES: 'Missiles', ARTILLERY: 'Artillery',
  NIGHT_VISION: 'Night Vision', RESPIRATORY: 'Respiratory', ANAESTHESIA: 'Anaesthesia',
  CARDIOLOGY: 'Cardiology', DIAGNOSTICS: 'Diagnostics', SURGICAL: 'Surgical',
  IMAGING: 'Imaging', REHABILITATION: 'Rehabilitation', MONITORING: 'Monitoring',
  DENTAL: 'Dental', OPHTHALMOLOGY: 'Ophthalmology', POWERTRAIN: 'Powertrain',
  ADAS: 'ADAS', INFOTAINMENT: 'Infotainment', BODY_ELECTRONICS: 'Body Electronics',
  CHASSIS: 'Chassis', HVAC_AUTO: 'Automotive HVAC', SAFETY_SYSTEMS: 'Safety Systems',
  EV_SYSTEMS: 'EV Systems', TELEMATICS: 'Telematics', RESIDENTIAL_AC: 'Residential AC',
  COMMERCIAL_AC: 'Commercial AC', INDUSTRIAL_AC: 'Industrial AC', CHILLER: 'Chiller',
  VRF_SYSTEM: 'VRF System', HEAT_PUMP: 'Heat Pump', VENTILATION: 'Ventilation',
  REFRIGERATION: 'Refrigeration', PCB_DESIGN: 'PCB Design', EMBEDDED_SYSTEMS: 'Embedded Systems',
  POWER_ELECTRONICS: 'Power Electronics', RF_MICROWAVE: 'RF / Microwave',
  SEMICONDUCTOR: 'Semiconductor', SENSORS: 'Sensors', DISPLAYS: 'Displays',
  CONNECTIVITY: 'Connectivity', SOFTWARE_DEV: 'Software Development', AI_ML: 'AI / ML',
  CLOUD: 'Cloud', CYBERSECURITY: 'Cybersecurity', IOT: 'IoT',
  DATA_ANALYTICS: 'Data Analytics', MOBILE_APP: 'Mobile App', ENTERPRISE_IT: 'Enterprise IT',
};

export const BUSINESS_STAGES = [
  { value: 'IDEA',        label: 'Idea',        color: 'bg-gray-100 text-gray-700' },
  { value: 'EXPLORING',   label: 'Exploring',   color: 'bg-blue-100 text-blue-700' },
  { value: 'PROPOSAL',    label: 'Proposal',    color: 'bg-indigo-100 text-indigo-700' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ACTIVE',      label: 'Active',      color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ON_HOLD',     label: 'On Hold',     color: 'bg-orange-100 text-orange-700' },
  { value: 'WON',         label: 'Won',         color: 'bg-green-100 text-green-700' },
  { value: 'LOST',        label: 'Lost',        color: 'bg-red-100 text-red-700' },
];

export const PROJECT_STATUSES = [
  { value: 'CONCEPT',     label: 'Concept',     color: 'bg-gray-100 text-gray-700' },
  { value: 'PROPOSAL',    label: 'Proposal',    color: 'bg-blue-100 text-blue-700' },
  { value: 'DEVELOPMENT', label: 'Development', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'TESTING',     label: 'Testing',     color: 'bg-yellow-100 text-yellow-700' },
  { value: 'DEPLOYED',    label: 'Deployed',    color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ON_HOLD',     label: 'On Hold',     color: 'bg-orange-100 text-orange-700' },
  { value: 'CANCELLED',   label: 'Cancelled',   color: 'bg-red-100 text-red-700' },
];

export const PROJECT_TYPES = [
  { value: 'PROJECT',  label: 'Project' },
  { value: 'PROGRAM',  label: 'Program' },
  { value: 'PRODUCT',  label: 'Product' },
  { value: 'SOLUTION', label: 'Solution' },
  { value: 'POC',      label: 'Proof of Concept' },
  { value: 'PILOT',    label: 'Pilot' },
];

export const PRODUCT_NATURES = [
  { value: 'ELECTRONIC',         label: 'Electronic' },
  { value: 'MECHANICAL',         label: 'Mechanical' },
  { value: 'ELECTRO_MECHANICAL', label: 'Electro-Mechanical' },
  { value: 'SOFTWARE',           label: 'Software' },
  { value: 'SYSTEM_INTEGRATION', label: 'System Integration' },
  { value: 'HYBRID',             label: 'Hybrid' },
];

export const PRIORITIES = [
  { value: 'LOW',      label: 'Low',      color: 'bg-gray-100 text-gray-600' },
  { value: 'MEDIUM',   label: 'Medium',   color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH',     label: 'High',     color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

export const FEEDBACK_SENTIMENTS = [
  { value: 'POSITIVE',    label: 'Positive',    color: 'bg-emerald-100 text-emerald-700', icon: '👍' },
  { value: 'NEUTRAL',     label: 'Neutral',     color: 'bg-gray-100 text-gray-700',       icon: '➖' },
  { value: 'NEGATIVE',    label: 'Negative',    color: 'bg-red-100 text-red-700',         icon: '👎' },
  { value: 'REQUIREMENT', label: 'Requirement', color: 'bg-blue-100 text-blue-700',       icon: '📋' },
];

export function getSector(value: string) {
  return SECTORS.find((s) => s.value === value);
}

export function getStage(value: string) {
  return BUSINESS_STAGES.find((s) => s.value === value);
}

export function getProjectStatus(value: string) {
  return PROJECT_STATUSES.find((s) => s.value === value);
}

export function getPriority(value: string) {
  return PRIORITIES.find((p) => p.value === value);
}

export function getSentiment(value: string) {
  return FEEDBACK_SENTIMENTS.find((f) => f.value === value);
}

export function formatCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ');
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}
