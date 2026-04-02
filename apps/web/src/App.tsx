import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import BusinessesListPage from './features/businesses/pages/BusinessesListPage';
import NewBusinessPage from './features/businesses/pages/NewBusinessPage';
import BusinessDetailPage from './features/businesses/pages/BusinessDetailPage';

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
          <Route path="/" element={<Navigate to="/businesses" replace />} />
          <Route path="/businesses" element={<BusinessesListPage />} />
          <Route path="/businesses/new" element={<NewBusinessPage />} />
          <Route path="/businesses/:id" element={<BusinessDetailPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
