/**
 * Shared types and interfaces for Coffee Digital Passport
 * Based on GS1 standards and EPCIS 2.0 specifications
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/** GS1 Global Trade Item Number - 14-digit, may include leading zeros */
export type GTIN = string;

/** Lot code identifier */
export type LotCode = string;

/** Serial number identifier */
export type Serial = string;

/** Global Location Number */
export type GLN = string;

// ============================================================================
// DIGITAL LINK INTERFACES
// ============================================================================

/** Digital Link keys resolved from path /01/:gtin/10/:lot */
export interface DigitalLinkKeys {
  gtin: GTIN;
  lot?: LotCode;
  serial?: Serial;
}

// ============================================================================
// ORGANIZATION & RBAC
// ============================================================================

/** Organization entity */
export interface Organization {
  id: string;
  name: string;
  region: string;
  hmacKey?: string; // per-tenant HMAC shared secret
  createdAt: string;
}

/** User roles for RBAC */
export type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER';

/** Actor user with organization context */
export interface ActorUser {
  id: string;
  email: string;
  orgId: string;
  role: Role;
}

// ============================================================================
// PRODUCT, FACILITY, LOT, BATCH
// ============================================================================

/** Product entity */
export interface Product {
  id: string;
  orgId: string;
  gtin: GTIN;
  name: string;
  brand: string;
  images: string[];
}

/** Facility entity with location data */
export interface Facility {
  id: string;
  orgId: string;
  gln?: GLN;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
}

/** Coffee lot entity */
export interface Lot {
  id: string;
  orgId: string;
  code: LotCode;
  harvestYear?: number;
  origin?: {
    country: string;
    region?: string;
    cooperative?: string;
  };
  varietals?: string[];
  process?: 'Washed' | 'Natural' | 'Honey' | string;
  altitudeMasl?: number;
}

/** Roast batch entity */
export interface Batch {
  id: string;
  orgId: string;
  code: string;
  roastDate?: string;
  profile?: string;
  machine?: string;
  inputLotCodes: LotCode[];
  netOutputKg?: number;
}

// ============================================================================
// CERTIFICATES
// ============================================================================

/** Certificate metadata */
export interface Certificate {
  id: string;
  orgId: string;
  type: string;
  issuer: string;
  validFrom?: string;
  validTo?: string;
  url?: string;
  vcJwt?: string; // W3C Verifiable Credential JWT
  fileKey?: string; // S3 object key
}

// ============================================================================
// EPCIS EVENTS
// ============================================================================

/** EPCIS Event types */
export type EpcisEventType = 'ObjectEvent' | 'AggregationEvent' | 'TransformationEvent' | 'TransactionEvent';

/** EPCIS Event wrapper stored in database */
export interface EpcisEventRecord {
  id: string;
  orgId: string;
  eventType: EpcisEventType;
  doc: any; // raw EPCIS JSON-LD
  eventTime: string; // ISO timestamp
  readPoint?: string; // SGLN URN
  bizLocation?: string; // SGLN URN
  hash: string; // content address hash
  signature?: string; // HMAC/Detached JWS
  createdAt: string;
}

// ============================================================================
// PUBLIC PASSPORT READ MODEL
// ============================================================================

/** Timeline event for passport display */
export interface TimelineEvent {
  eventTime: string;
  bizStep: string;
  summary: string;
  actor: {
    name: string;
    role?: string;
    location?: string;
  };
}

/** Public passport read model */
export interface Passport {
  product: {
    gtin: GTIN;
    name: string;
    brand: string;
    images: { url: string; alt?: string }[];
  };
  lot?: {
    code: LotCode;
    harvestYear?: number;
    originCountry?: string;
    varietals?: string[];
    process?: string;
    altitudeMasl?: number;
  };
  batch?: {
    roastDate?: string;
    profile?: string;
    machine?: string;
  };
  timeline: TimelineEvent[];
  certifications: {
    type: string;
    issuer: string;
    validFrom?: string;
    validTo?: string;
    url?: string;
    status?: 'valid' | 'expired' | 'unknown';
  }[];
}

// ============================================================================
// API CONTRACTS
// ============================================================================

/** EPCIS capture request */
export interface EpcisCaptureRequest {
  events: any[]; // EPCIS JSON-LD events per GS1 artefacts
}

/** EPCIS capture response */
export interface EpcisCaptureResponse {
  accepted: boolean;
  ingestedCount: number;
  ids: string[];
  warnings?: string[];
}

/** Error response */
export interface ErrorResponse {
  error: 'HMAC_MISMATCH' | 'SCHEMA_INVALID' | 'SHACL_INVALID' | 'IDEMPOTENT_REPLAY' | 'UNAUTHORIZED' | 'FORBIDDEN';
  detail: string;
}

/** Scan telemetry event */
export interface ScanEvent {
  id: string;
  ts: string;
  gtin: string;
  lot?: string;
  serial?: string;
  country?: string;
  city?: string;
  ua?: string;
  resolverLatencyMs?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

// Digital Link utilities
export * from './digital-link';

// HMAC utilities
export * from './hmac';

// Logging utilities
export * from './logger';
