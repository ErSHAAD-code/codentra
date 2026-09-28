import { Badge } from '@/components/ui/badge';

const SEVERITY_VARIANT = {
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'primary',
  INFO: 'default',
} as const;

export function SeverityBadge({ severity }: { severity: keyof typeof SEVERITY_VARIANT }) {
  return <Badge variant={SEVERITY_VARIANT[severity]}>{severity}</Badge>;
}
