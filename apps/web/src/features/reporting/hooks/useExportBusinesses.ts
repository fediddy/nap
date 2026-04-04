export function useExportBusinesses() {
  const exportCsv = async (options: { includeSubmissions?: boolean; status?: string }) => {
    const params = new URLSearchParams();
    if (options.includeSubmissions) params.set('includeSubmissions', 'true');
    if (options.status) params.set('status', options.status);
    const res = await fetch(`/api/export/businesses?${params}`);
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nap-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return { exportCsv };
}
