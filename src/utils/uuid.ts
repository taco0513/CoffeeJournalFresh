import uuid from 'react-native-uuid';

/**
 * Generate a UUID v4 string
 * @returns UUID string
 */
export function generateUUID(): string {
  return uuid.v4() as string;
}

/**
 * Validate if a string is a valid UUID
 * @param id - String to validate
 * @returns Boolean indicating if the string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}