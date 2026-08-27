import { History } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="History"
        description="Every logged set, grouped by date and sorted chronologically."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="card p-5">
            <EmptyState
              icon={History}
              title="No workout history yet"
              description="Once you start logging sets, they'll appear here grouped by date so you can review your training over time."
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
