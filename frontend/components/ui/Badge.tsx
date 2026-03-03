import { cn, statusColors } from '@/lib/utils';

export default function Badge({ status, className }: { status: string; className?: string }) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', color, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
