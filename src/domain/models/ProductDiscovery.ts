/**
 * Domain model representing an Epic in the product discovery process
 */
export interface Epic {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  priority: Priority;
  type: EpicType;
}

/**
 * MoSCoW prioritization levels
 */
export type Priority =
  | 'P0 (Must)'
  | 'P1 (Should)'
  | 'P2 (Could)'
  | "P3 (Won't now)";

/**
 * Epic types aligned with team responsibilities
 */
export type EpicType =
  | 'Time de negócios'
  | 'Time de desenvolvimento'
  | 'Time de experiência do usuário'
  | 'Time de qualidade';

/**
 * Product Discovery Solution
 */
export interface ProductDiscoverySolution {
  name: string;
  solution: string;
  epics: Epic[];
}

/**
 * Input request for product discovery
 */
export interface ProductDiscoveryRequest {
  problem: string;
}

/**
 * Language code
 */
export type LanguageCode = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'unknown';
