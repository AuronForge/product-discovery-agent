import { z } from 'zod';

/**
 * Request validation schema using Zod
 */
export const ProductDiscoveryRequestSchema = z.object({
  problem: z
    .string()
    .min(10, 'Problem description must be at least 10 characters long')
    .max(5000, 'Problem description must not exceed 5000 characters')
    .trim()
});

/**
 * Type inference from schema
 */
export type ProductDiscoveryRequestDTO = z.infer<typeof ProductDiscoveryRequestSchema>;
