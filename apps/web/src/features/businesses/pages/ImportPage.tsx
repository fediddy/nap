import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import {
  useImportBusinesses,
  useBulkUpdateBusinesses,
  type ImportResult,
  type ValidationPreview,
  type PreviewRow,
} from '../hooks/useImportBusinesses';

const CSV_TEMPLATE_HEADERS = 'name,address,city,state,zip,phone,category,website';
const CSV_TEMPLATE_EXAMPLE = '"Acme Plumbing","123 Main St","Springfield","IL","62701","(555) 555-1234","Plumbing","https://acmeplumbing.example.com"';
const CSV_TEMPLATE = `${CSV_TEMPLATE_HEADERS}\n${CSV_TEMPLATE_EXAMPLE}\n`;

function isImportResult(result: ImportResult | ValidationPreview): result is ImportResult {
  return 'batchId' in result;
}

function shortenId(id: string): string {
  return id.slice(0, 8);
}

type Stage = 'upload' | 'preview';

export default function ImportPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useImportBusinesses();
  const { mutate: bulkUpdate, isPending: isBulkPending } = useBulkUpdateBusinesses();

  const [stage, setStage] = useState<Stage>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [preview, setPreview] = useState<ValidationPreview | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Story 2.3: Inline editing state
  const [editableRows, setEditableRows] = useState<Array<PreviewRow>>([]);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  const [expandedDiffs, setExpandedDiffs] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed counts from editable rows
  const validCount = editableRows.filter((r) => r.valid).length;
  const invalidCount = editableRows.filter((r) => !r.valid).length;

  // --- Template download ---
  function handleDownloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'businesses-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- File handling ---
  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  // --- Import ---
  function handleImport(importValidOnly = false) {
    if (!csvContent || !selectedFile) return;

    mutate(
      { csv: csvContent, filename: selectedFile.name, importValidOnly, skipDuplicates },
      {
        onSuccess: (result) => {
          if (isImportResult(result)) {
            toast.success(`${result.imported} business${result.imported !== 1 ? 'es' : ''} imported successfully`);
            navigate('/businesses');
          } else {
            // Validation preview
            setPreview(result);
            setEditableRows(result.preview.map((r) => ({ ...r })));
            setStage('preview');
          }
        },
        onError: (err) => {
          toast.error(err.message ?? 'Import failed');
        },
      }
    );
  }

  // Story 2.3: Import valid rows using editable row data
  function handleImportValidOnly() {
    if (!selectedFile) return;

    const validEditableRows = editableRows.filter((r) => r.valid);
    if (validEditableRows.length === 0) return;

    const rows = validEditableRows.map((r) => r.data);

    mutate(
      {
        rows,
        filename: selectedFile.name,
        importValidOnly: true,
        skipDuplicates,
      },
      {
        onSuccess: (result) => {
          if (isImportResult(result)) {
            toast.success(`${result.imported} business${result.imported !== 1 ? 'es' : ''} imported successfully`);
            navigate('/businesses');
          } else {
            setPreview(result);
            setEditableRows(result.preview.map((r) => ({ ...r })));
          }
        },
        onError: (err) => {
          toast.error(err.message ?? 'Import failed');
        },
      }
    );
  }

  // Story 2.4: Import only non-duplicate rows
  function handleImportNewOnly() {
    if (!selectedFile) return;

    const newRows = editableRows.filter((r) => r.valid && !r.isDuplicate);
    if (newRows.length === 0) {
      toast.info('No new (non-duplicate) rows to import');
      return;
    }

    mutate(
      {
        rows: newRows.map((r) => r.data),
        filename: selectedFile.name,
        importValidOnly: true,
        skipDuplicates: false, // we already filtered
      },
      {
        onSuccess: (result) => {
          if (isImportResult(result)) {
            toast.success(`${result.imported} business${result.imported !== 1 ? 'es' : ''} imported successfully`);
            navigate('/businesses');
          } else {
            setPreview(result);
            setEditableRows(result.preview.map((r) => ({ ...r })));
          }
        },
        onError: (err) => {
          toast.error(err.message ?? 'Import failed');
        },
      }
    );
  }

  // Story 2.4: Apply updates to existing businesses
  function handleApplyUpdates() {
    const updateRows = editableRows.filter((r) => r.isDuplicate && r.isUpdate && r.duplicateOf);
    if (updateRows.length === 0) {
      toast.info('No updates to apply');
      return;
    }

    const updates = updateRows.map((r) => ({
      id: r.duplicateOf!.id,
      fields: {
        name: r.data.name,
        address: r.data.address,
        city: r.data.city,
        state: r.data.state,
        zip: r.data.zip,
        phone: r.data.phone,
        category: r.data.category,
        website: r.data.website,
      },
    }));

    bulkUpdate(
      { updates },
      {
        onSuccess: (result) => {
          toast.success(`${result.updated} business${result.updated !== 1 ? 'es' : ''} updated`);
          navigate('/businesses');
        },
        onError: (err) => {
          toast.error(err.message ?? 'Update failed');
        },
      }
    );
  }

  function handleCancel() {
    setStage('upload');
    setSelectedFile(null);
    setCsvContent('');
    setPreview(null);
    setEditableRows([]);
    setEditingCell(null);
    setExpandedDiffs(new Set());
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Story 2.3: Inline cell editing
  function handleCellClick(rowIndex: number, field: string, isValid: boolean) {
    if (!isValid) {
      setEditingCell({ rowIndex, field });
    }
  }

  function handleCellChange(rowIndex: number, field: string, value: string) {
    setEditableRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        data: { ...updated[rowIndex].data, [field]: value },
      };
      return updated;
    });
  }

  function handleCellBlur(rowIndex: number) {
    // Re-validate the row
    revalidateRow(rowIndex);
    setEditingCell(null);
  }

  function handleCellKeyDown(e: React.KeyboardEvent, rowIndex: number) {
    if (e.key === 'Enter') {
      revalidateRow(rowIndex);
      setEditingCell(null);
    }
  }

  function revalidateRow(rowIndex: number) {
    const row = editableRows[rowIndex];
    if (!row) return;

    // Simple client-side validation matching server schema
    const data = row.data;
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Name: Business name is required');
    if (!data.address?.trim()) errors.push('Address: Address is required');
    if (!data.city?.trim()) errors.push('City: City is required');
    if (!data.state?.trim()) errors.push('State: State is required');
    if (!data.zip?.trim()) errors.push('Zip: ZIP code is required');
    if (!data.phone?.trim()) {
      errors.push('Phone: Enter a valid US phone number');
    } else if (!/^(\+1\s?)?((\(\d{3}\))|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}$/.test(data.phone)) {
      errors.push('Phone: Enter a valid US phone number');
    }
    if (!data.category?.trim()) errors.push('Category: Category is required');
    if (data.website && data.website.trim() !== '') {
      try {
        new URL(data.website);
      } catch {
        errors.push('Website: Invalid url');
      }
    }

    setEditableRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        valid: errors.length === 0,
        errors,
      };
      return updated;
    });
  }

  function toggleDiff(rowIndex: number) {
    setExpandedDiffs((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  }

  const updateRows = editableRows.filter((r) => r.isDuplicate && r.isUpdate);
  const newOnlyCount = editableRows.filter((r) => r.valid && !r.isDuplicate).length;

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Import Businesses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV file to bulk-import business profiles.
          </p>
        </div>

        {stage === 'upload' && (
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {/* Template download */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Need a template?{' '}
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="font-medium text-primary-600 hover:text-primary-700 underline"
                >
                  Download CSV template
                </button>
              </p>
            </div>

            {/* Drag-drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'cursor-pointer rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors',
                isDragOver
                  ? 'border-primary-500 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">File selected — click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {isDragOver ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
                  </p>
                  <p className="text-xs text-gray-500">or click to browse</p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Import button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!selectedFile || isPending}
                onClick={() => handleImport(false)}
                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Uploading…' : 'Upload & Import'}
              </button>
            </div>
          </div>
        )}

        {stage === 'preview' && preview && (
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {/* Summary — Story 2.1 */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">
                <span className="text-green-600">{validCount} valid</span>
                {', '}
                <span className="text-red-600">{invalidCount} invalid</span>
                {' — fix errors or import valid rows only'}
              </p>
              {validCount === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  No valid rows to import — please fix errors and re-upload
                </p>
              )}
            </div>

            {/* Skip duplicates checkbox — Story 2.2 */}
            <div className="mb-4 flex items-center gap-2">
              <input
                id="skipDuplicates"
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="skipDuplicates" className="text-sm text-gray-700">
                Skip duplicate rows
              </label>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Row</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Address</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Errors / Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {editableRows.map((item, rowIndex) => {
                    const isDiffExpanded = expandedDiffs.has(rowIndex);
                    const rowBg = item.isDuplicate && !item.isUpdate
                      ? 'bg-gray-50'
                      : item.valid
                      ? ''
                      : 'bg-red-50';

                    return (
                      <>
                        <tr key={`row-${item.row}`} className={rowBg}>
                          <td className="px-3 py-2 text-gray-500">{item.row}</td>

                          {/* Editable Name cell */}
                          <td
                            className={cn(
                              'px-3 py-2 font-medium',
                              !item.valid && editingCell?.rowIndex === rowIndex && editingCell.field === 'name'
                                ? 'p-0'
                                : '',
                              !item.valid && item.errors.some((e) => e.startsWith('Name'))
                                ? 'text-red-700'
                                : 'text-gray-900'
                            )}
                            onClick={() => handleCellClick(rowIndex, 'name', item.valid)}
                          >
                            {!item.valid && editingCell?.rowIndex === rowIndex && editingCell.field === 'name' ? (
                              <input
                                autoFocus
                                className="w-full border border-primary-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={item.data.name ?? ''}
                                onChange={(e) => handleCellChange(rowIndex, 'name', e.target.value)}
                                onBlur={() => handleCellBlur(rowIndex)}
                                onKeyDown={(e) => handleCellKeyDown(e, rowIndex)}
                              />
                            ) : (
                              <span className={cn(!item.valid ? 'cursor-text underline decoration-dotted' : '')}>
                                {item.data.name ?? '—'}
                              </span>
                            )}
                          </td>

                          {/* Address */}
                          <td
                            className={cn(
                              'px-3 py-2',
                              !item.valid && item.errors.some((e) => e.startsWith('Address'))
                                ? 'text-red-700'
                                : 'text-gray-600'
                            )}
                            onClick={() => handleCellClick(rowIndex, 'address', item.valid)}
                          >
                            {!item.valid && editingCell?.rowIndex === rowIndex && editingCell.field === 'address' ? (
                              <input
                                autoFocus
                                className="w-full border border-primary-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={item.data.address ?? ''}
                                onChange={(e) => handleCellChange(rowIndex, 'address', e.target.value)}
                                onBlur={() => handleCellBlur(rowIndex)}
                                onKeyDown={(e) => handleCellKeyDown(e, rowIndex)}
                              />
                            ) : (
                              <span className={cn(!item.valid ? 'cursor-text' : '')}>
                                {item.data.address ?? '—'}
                              </span>
                            )}
                          </td>

                          {/* Phone */}
                          <td
                            className={cn(
                              'px-3 py-2',
                              !item.valid && item.errors.some((e) => e.startsWith('Phone'))
                                ? 'text-red-700'
                                : 'text-gray-600'
                            )}
                            onClick={() => handleCellClick(rowIndex, 'phone', item.valid)}
                          >
                            {!item.valid && editingCell?.rowIndex === rowIndex && editingCell.field === 'phone' ? (
                              <input
                                autoFocus
                                className="w-full border border-primary-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={item.data.phone ?? ''}
                                onChange={(e) => handleCellChange(rowIndex, 'phone', e.target.value)}
                                onBlur={() => handleCellBlur(rowIndex)}
                                onKeyDown={(e) => handleCellKeyDown(e, rowIndex)}
                              />
                            ) : (
                              <span className={cn(!item.valid ? 'cursor-text' : '')}>
                                {item.data.phone ?? '—'}
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td
                            className={cn(
                              'px-3 py-2',
                              !item.valid && item.errors.some((e) => e.startsWith('Category'))
                                ? 'text-red-700'
                                : 'text-gray-600'
                            )}
                            onClick={() => handleCellClick(rowIndex, 'category', item.valid)}
                          >
                            {!item.valid && editingCell?.rowIndex === rowIndex && editingCell.field === 'category' ? (
                              <input
                                autoFocus
                                className="w-full border border-primary-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={item.data.category ?? ''}
                                onChange={(e) => handleCellChange(rowIndex, 'category', e.target.value)}
                                onBlur={() => handleCellBlur(rowIndex)}
                                onKeyDown={(e) => handleCellKeyDown(e, rowIndex)}
                              />
                            ) : (
                              <span className={cn(!item.valid ? 'cursor-text' : '')}>
                                {item.data.category ?? '—'}
                              </span>
                            )}
                          </td>

                          {/* Status badge — Stories 2.2, 2.4 */}
                          <td className="px-3 py-2">
                            {!item.valid ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Error
                              </span>
                            ) : item.isDuplicate && item.isUpdate ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Update
                                </span>
                                {item.duplicateOf && (
                                  <p className="text-xs text-gray-500">
                                    Matches: {item.duplicateOf.name} (ID: {shortenId(item.duplicateOf.id)})
                                  </p>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleDiff(rowIndex)}
                                  className="text-xs text-blue-600 underline hover:text-blue-800"
                                >
                                  {isDiffExpanded ? 'Hide Changes' : 'Show Changes'}
                                </button>
                              </div>
                            ) : item.isDuplicate && !item.isUpdate ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  No Changes
                                </span>
                                {item.duplicateOf && (
                                  <p className="text-xs text-gray-500">
                                    Matches: {item.duplicateOf.name} (ID: {shortenId(item.duplicateOf.id)})
                                  </p>
                                )}
                              </div>
                            ) : item.isDuplicate ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                  Duplicate
                                </span>
                                {item.duplicateOf && (
                                  <p className="text-xs text-gray-500">
                                    Matches: {item.duplicateOf.name} (ID: {shortenId(item.duplicateOf.id)})
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                Valid
                              </span>
                            )}
                          </td>

                          {/* Errors / Info */}
                          <td className="px-3 py-2 text-xs text-red-600">
                            {item.errors.length > 0 ? item.errors.join('; ') : null}
                          </td>
                        </tr>

                        {/* Story 2.4: Diff row */}
                        {isDiffExpanded && item.changedFields && item.changedFields.length > 0 && (
                          <tr key={`diff-${item.row}`} className="bg-blue-50">
                            <td colSpan={7} className="px-4 py-2">
                              <div className="space-y-1">
                                {item.changedFields.map((cf) => (
                                  <div key={cf.field} className="flex items-center gap-2 text-xs">
                                    <span className="w-20 font-semibold capitalize text-gray-700">{cf.field}:</span>
                                    <span className="text-red-600 line-through">{cf.oldValue || '(empty)'}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-green-700">{cf.newValue || '(empty)'}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Story 2.4: Update/Import new only section */}
            {(updateRows.length > 0 || newOnlyCount > 0) && (
              <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-200 pt-4">
                {updateRows.length > 0 && (
                  <button
                    type="button"
                    disabled={isBulkPending}
                    onClick={handleApplyUpdates}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBulkPending ? 'Applying…' : `Apply Updates (${updateRows.length})`}
                  </button>
                )}
                {newOnlyCount > 0 && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleImportNewOnly}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Importing…' : `Import New Only (${newOnlyCount})`}
                  </button>
                )}
              </div>
            )}

            {/* Primary Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={validCount === 0 || isPending}
                title={validCount === 0 ? 'No valid rows to import — please fix errors and re-upload' : undefined}
                onClick={handleImportValidOnly}
                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Importing…' : `Import Valid Rows Only (${validCount})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
