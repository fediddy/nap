// Re-export businessProfileSchema as importRowSchema
// All import validation flows through shared — no duplication
export { businessProfileSchema as importRowSchema } from './business.schema.js';
export type { BusinessProfileInput as ImportRowInput } from './business.schema.js';
