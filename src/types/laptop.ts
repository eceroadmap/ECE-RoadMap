export type CpuBrand = 'intel' | 'amd' | 'apple' | 'other';
export type CpuTier = 'i3' | 'i5' | 'i7' | 'i9' | 'ryzen3' | 'ryzen5' | 'ryzen7' | 'ryzen9' | 'appleM' | 'other';
export type CpuGen = 'older' | 'gen8_10' | 'gen11_12' | 'gen13_plus' | 'apple_silicon';
export type StorageType = 'hdd' | 'ssd_sata' | 'ssd_nvme';
export type GpuTier = 'integrated' | 'dedicated_entry' | 'dedicated_mid_high' | 'apple_gpu';
export type OperatingSystem = 'windows' | 'macos' | 'linux';
export type ScreenSize = '13_14' | '15_6' | '16_17';

export interface LaptopSpecs {
  cpuBrand: CpuBrand;
  cpuTier: CpuTier;
  cpuGen: CpuGen;
  ramGb: number;
  storageType: StorageType;
  storageCapacityGb: number;
  gpuTier: GpuTier;
  screenSize?: ScreenSize;
  screenResolution?: string;
  os: OperatingSystem;
}

export type LaptopSuitabilityLevel = 'minimum' | 'preferred' | 'comfortable' | 'elite';

export interface DepartmentRecommendedSpecs {
  minRamGb: number;
  targetRamGb: number;
  targetStorageGb: number; // 1000 GB (1 TB)
  targetStorageType: string;
  targetCpuTier: string;
  targetGpuTier: string;
  targetOs: string;
  targetScreen: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ComparisonItem {
  aspect: string;
  aspectKey: 'ram' | 'storage' | 'storage_type' | 'cpu' | 'gpu' | 'os' | 'screen';
  userValue: string;
  recommendedValue: string;
  status: 'pass' | 'warning' | 'optimal';
  note?: string;
}

export interface LaptopEvaluationResult {
  scorePercentage: number;
  level: LaptopSuitabilityLevel;
  badgeAr: string;
  titleAr: string;
  summaryAr: string;
  suitableFor: string[];
  limitingFor: string[];
  affectedSoftware: string[];
  practicalAdvice: string[];
  suitableFields: string[];
  comparison: ComparisonItem[];
}

export interface RecommendedLaptopModel {
  id: string;
  name: string;
  brand: string;
  image: string;
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  screenSize: string;
  os: string;
  priceEstimate?: string;
  suitabilityLevel: 'budget' | 'balanced' | 'pro' | 'custom';
  suitabilityBadge: string;
  suitableFor: string[]; // e.g. ['البرمجة', 'MATLAB / Simulink', 'المحاكاة الهندسية', 'الأنظمة المدمجة', 'مشاريع التخرج']
  pros: string[];
  notes?: string;
  isRecommended?: boolean;
  status?: 'active' | 'archived';
  updatedAt?: string;
  updatedBy?: string;
}
