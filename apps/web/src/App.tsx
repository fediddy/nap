import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';

// Business pages
import BusinessesListPage from './features/businesses/pages/BusinessesListPage';
import NewBusinessPage from './features/businesses/pages/NewBusinessPage';
import BusinessDetailPage from './features/businesses/pages/BusinessDetailPage';
import ImportPage from './features/businesses/pages/ImportPage';
import SubmissionPlanPage from './features/businesses/pages/SubmissionPlanPage';

// Directory pages
import DirectoriesListPage from './features/directories/pages/DirectoriesListPage';
import AddDirectoryPage from './features/directories/pages/AddDirectoryPage';

// Monitoring pages
import DashboardPage from './features/monitoring/pages/DashboardPage';
import StatusMatrixPage from './features/monitoring/pages/StatusMatrixPage';
import ActionQueuePage from './features/monitoring/pages/ActionQueuePage';
import BusinessCitationPage from './features/monitoring/pages/BusinessCitationPage';

// Reporting pages
import ExportPage from './features/reporting/pages/ExportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matrix" element={<StatusMatrixPage />} />
            <Route path="/actions" element={<ActionQueuePage />} />

            {/* Businesses */}
            <Route path="/businesses" element={<BusinessesListPage />} />
            <Route path="/businesses/new" element={<NewBusinessPage />} />
            <Route path="/businesses/import" element={<ImportPage />} />
            <Route path="/businesses/:id" element={<BusinessDetailPage />} />
            <Route path="/businesses/:id/plan" element={<SubmissionPlanPage />} />
            <Route path="/businesses/:id/citations" element={<BusinessCitationPage />} />

            {/* Directories */}
            <Route path="/directories" element={<DirectoriesListPage />} />
            <Route path="/directories/new" element={<AddDirectoryPage />} />

            {/* Reporting */}
            <Route path="/export" element={<ExportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
