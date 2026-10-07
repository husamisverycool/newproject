import { LIVE } from './static';

/**
 * Whether this page may use a device. Inside Claude the app runs in a frame that may not be allowed
 * the camera or microphone; then the camera falls back to the system camera (a file picker with
 * `capture`) and voice notes are left out rather than failing on tap.
 */
export function allows(feature: 'camera' | 'microphone') {
  const policy = (document as Document & { featurePolicy?: { allowsFeature(f: string): boolean }; permissionsPolicy?: { allowsFeature(f: string): boolean } }).permissionsPolicy ??
    (document as Document & { featurePolicy?: { allowsFeature(f: string): boolean } }).featurePolicy;
  if (policy?.allowsFeature) return policy.allowsFeature(feature);
  return !LIVE;
}
