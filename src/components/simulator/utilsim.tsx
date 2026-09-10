import masterDataRaw from './models/master_models.json'
import telemetryDataRaw from '../../assets/data.json'
import headerMappingRaw from '../../assets/headerdatasimulator.json'

// Interface Data
export interface ModelCoefficients {
  A20: number; A11: number; A02: number;
  A10: number; A01: number; A00: number;
}

export interface ModelData {
  features: { x_axis: string; y_axis: string; z_axis: string }
  scaling: { x_mean: number; x_std: number; y_mean: number; y_std: number }
  coefficients: ModelCoefficients
  metrics: { r2_score: number }
}

export interface MasterModelsJSON {
  models: Record<string, ModelData>
}

export interface TelemetryItem {
  No: number;
  Parameter: string;
  Unit: string;
  Min: number;
  Max: number;
}

export interface HeaderMappingJSON {
  model_mappings: Record<string, number>
}

// Parsing Raw JSON
export const masterData = masterDataRaw as unknown as MasterModelsJSON
export const telemetryList = telemetryDataRaw as unknown as TelemetryItem[]
export const headerMapping = headerMappingRaw as unknown as HeaderMappingJSON

// Map telemetry berdasarkan nomor ID ("No") dari data.json
export const telemetryByIdMap = new Map<number, TelemetryItem>(
  telemetryList.map((item) => [item.No, item])
)

// Fungsi Kalkulasi Polinomial Murni: Z = A20*x² + A11*x*y + A02*y² + A10*x + A01*y + A00
export function calculateRawPolynomial(x: number, y: number, coeff: ModelCoefficients): number {
  const { A20, A11, A02, A10, A01, A00 } = coeff
  return (
    A20 * (x ** 2) +
    A11 * (x * y) +
    A02 * (y ** 2) +
    A10 * x +
    A01 * y +
    A00
  )
}

// Map manual (Hardcode) dari Header ID langsung ke Nama Kategori
const CATEGORY_ID_MAP: Record<number, string> = {
  // 1. Exhaust & Turbocharger
  22: '1. Exhaust & Turbocharger',
  23: '1. Exhaust & Turbocharger',
  24: '1. Exhaust & Turbocharger',
  25: '1. Exhaust & Turbocharger',
  26: '1. Exhaust & Turbocharger',
  27: '1. Exhaust & Turbocharger',
  28: '1. Exhaust & Turbocharger',
  29: '1. Exhaust & Turbocharger',
  31: '1. Exhaust & Turbocharger',
  32: '1. Exhaust & Turbocharger',

  // 2. High-Temperature Cooling Water (HTCW)
  57: '2. High-Temperature Cooling Water (HTCW)',
  58: '2. High-Temperature Cooling Water (HTCW)',
  59: '2. High-Temperature Cooling Water (HTCW)',
  60: '2. High-Temperature Cooling Water (HTCW)',
  61: '2. High-Temperature Cooling Water (HTCW)',
  62: '2. High-Temperature Cooling Water (HTCW)',
  63: '2. High-Temperature Cooling Water (HTCW)',
  64: '2. High-Temperature Cooling Water (HTCW)',
  65: '2. High-Temperature Cooling Water (HTCW)',
  66: '2. High-Temperature Cooling Water (HTCW)',
  67: '2. High-Temperature Cooling Water (HTCW)',

  // 3. Low-Temperature Cooling Water (LTCW)
  72: '3. Low-Temperature Cooling Water (LTCW)',
  73: '3. Low-Temperature Cooling Water (LTCW)',
  74: '3. Low-Temperature Cooling Water (LTCW)',
  75: '3. Low-Temperature Cooling Water (LTCW)',
  76: '3. Low-Temperature Cooling Water (LTCW)',
  77: '3. Low-Temperature Cooling Water (LTCW)',
  78: '3. Low-Temperature Cooling Water (LTCW)',

  // 4. Lube Oil System
  88: '4. Lube Oil System',
  89: '4. Lube Oil System',
  90: '4. Lube Oil System',
  91: '4. Lube Oil System',
  92: '4. Lube Oil System',
  93: '4. Lube Oil System',

  // 5. Charge Air & Fuel System
  100: '5. Charge Air & Fuel System',
  101: '5. Charge Air & Fuel System',
  102: '5. Charge Air & Fuel System',
  103: '5. Charge Air & Fuel System',
  104: '5. Charge Air & Fuel System',
  105: '5. Charge Air & Fuel System',
  106: '5. Charge Air & Fuel System',
  107: '5. Charge Air & Fuel System',
  108: '5. Charge Air & Fuel System',
  109: '5. Charge Air & Fuel System',
  110: '5. Charge Air & Fuel System',
}

// Fungsi Pengelompokan Kategori Berdasarkan ID Header (Hardcoded Look-up)
export function getCategory(modelName: string): string {
  const id = headerMapping.model_mappings[modelName]
  if (!id) return 'Other Parameters'

  return CATEGORY_ID_MAP[id] ?? 'Other Parameters'
}

// Helper untuk mengambil entries dan melakukan grouping
export function getGroupedModels() {
  const modelsEntries = Object.entries(masterData.models)
  return modelsEntries.reduce((acc, entry) => {
    const [modelName] = entry
    const category = getCategory(modelName)
    if (!acc[category]) acc[category] = []
    acc[category].push(entry)
    return acc
  }, {} as Record<string, typeof modelsEntries>)
}