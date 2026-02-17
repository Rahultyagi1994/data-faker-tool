import { useState } from 'react';
import { CustomColumn, createDefaultColumn } from '../utils/customColumns';
import { cn } from '../utils/cn';

interface Props {
  columns: CustomColumn[];
  onChange: (columns: CustomColumn[]) => void;
  onClose: () => void;
}

export default function CustomColumnsModal({ columns, onChange, onClose }: Props) {
  const [localColumns, setLocalColumns] = useState<CustomColumn[]>(
    columns.length > 0 ? columns : [createDefaultColumn()]
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    localColumns.length > 0 ? localColumns[0].id : null
  );
  const [newOptionText, setNewOptionText] = useState<Record<string, string>>({});

  const updateColumn = (id: string, updates: Partial<CustomColumn>) => {
    setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addColumn = () => {
    const newCol = createDefaultColumn();
    setLocalColumns(prev => [...prev, newCol]);
    setExpandedId(newCol.id);
  };

  const removeColumn = (id: string) => {
    setLocalColumns(prev => prev.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const duplicateColumn = (col: CustomColumn) => {
    const newCol = {
      ...col,
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${col.name}_copy`,
    };
    setLocalColumns(prev => [...prev, newCol]);
    setExpandedId(newCol.id);
  };

  const addOption = (colId: string, field: 'options' | 'textPool') => {
    const text = (newOptionText[`${colId}_${field}`] || '').trim();
    if (!text) return;
    setLocalColumns(prev => prev.map(c => {
      if (c.id === colId) {
        return { ...c, [field]: [...c[field], text] };
      }
      return c;
    }));
    setNewOptionText(prev => ({ ...prev, [`${colId}_${field}`]: '' }));
  };

  const removeOption = (colId: string, field: 'options' | 'textPool', index: number) => {
    setLocalColumns(prev => prev.map(c => {
      if (c.id === colId) {
        return { ...c, [field]: c[field].filter((_, i) => i !== index) };
      }
      return c;
    }));
  };

  const handleApply = () => {
    const validColumns = localColumns.filter(c => c.name.trim());
    onChange(validColumns);
    onClose();
  };

  const handleClear = () => {
    onChange([]);
    onClose();
  };

  const typeOptions: { value: CustomColumn['type']; label: string; icon: string; desc: string }[] = [
    { value: 'text', label: 'Text', icon: '🔤', desc: 'Random text from a word pool' },
    { value: 'number', label: 'Number', icon: '🔢', desc: 'Random number in a range' },
    { value: 'boolean', label: 'Boolean', icon: '✅', desc: 'True/False with probability' },
    { value: 'date', label: 'Date', icon: '📅', desc: 'Random date in a range' },
    { value: 'select', label: 'Select', icon: '📋', desc: 'Pick from a custom list' },
    { value: 'formula', label: 'Formula', icon: '🧮', desc: 'Computed from other fields' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-dark-900 border border-dark-650 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700/50 bg-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-lg">➕</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Custom Columns</h2>
              <p className="text-[12px] text-dark-400">Add your own columns with custom data types</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-dark-500 bg-dark-750 px-2 py-1 rounded-lg">
              {localColumns.length} column{localColumns.length !== 1 ? 's' : ''}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-750 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {localColumns.map((col, idx) => {
            const isExpanded = expandedId === col.id;
            return (
              <div
                key={col.id}
                className={cn(
                  'border rounded-xl overflow-hidden transition-all duration-200',
                  isExpanded ? 'border-cyan-500/30 bg-dark-800/60' : 'border-dark-650 bg-dark-800/30'
                )}
              >
                {/* Column Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-dark-750/50 transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); updateColumn(col.id, { enabled: !col.enabled }); }}
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      col.enabled
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'border-dark-500 bg-dark-750'
                    )}
                  >
                    {col.enabled && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <span className="text-dark-500 text-[11px] font-mono w-5">#{idx + 1}</span>

                  <span className="text-lg">{typeOptions.find(t => t.value === col.type)?.icon || '📝'}</span>

                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm font-semibold truncate', col.name ? 'text-dark-100' : 'text-dark-500 italic')}>
                      {col.name || 'Unnamed column'}
                    </div>
                    <div className="text-[10px] text-dark-500">
                      {typeOptions.find(t => t.value === col.type)?.label || col.type}
                      {col.nullPercent > 0 && ` · ${col.nullPercent}% null`}
                      {col.prefix && ` · prefix: "${col.prefix}"`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); duplicateColumn(col); }}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-dark-200 hover:bg-dark-700 transition-all"
                      title="Duplicate"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); removeColumn(col.id); }}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <svg className={cn('w-4 h-4 text-dark-500 transition-transform', isExpanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-dark-700/50 pt-4">
                    {/* Column Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Column Name *</label>
                      <input
                        type="text"
                        value={col.name}
                        onChange={e => updateColumn(col.id, { name: e.target.value.replace(/\s/g, '_') })}
                        placeholder="e.g. risk_score, category, expiry_date"
                        className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 outline-none font-[JetBrains_Mono,monospace]"
                      />
                    </div>

                    {/* Type Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Data Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {typeOptions.map(t => (
                          <button
                            key={t.value}
                            onClick={() => updateColumn(col.id, { type: t.value })}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all',
                              col.type === t.value
                                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                                : 'border-dark-600 bg-dark-750 text-dark-300 hover:border-dark-500'
                            )}
                          >
                            <span className="text-sm">{t.icon}</span>
                            <div>
                              <div className="text-[12px] font-semibold">{t.label}</div>
                              <div className="text-[9px] text-dark-500 leading-tight">{t.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type-specific settings */}
                    {col.type === 'number' && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Min</label>
                          <input type="number" value={col.minValue} onChange={e => updateColumn(col.id, { minValue: Number(e.target.value) })}
                            className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 font-[JetBrains_Mono,monospace] focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Max</label>
                          <input type="number" value={col.maxValue} onChange={e => updateColumn(col.id, { maxValue: Number(e.target.value) })}
                            className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 font-[JetBrains_Mono,monospace] focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Decimals</label>
                          <input type="number" min={0} max={6} value={col.decimals} onChange={e => updateColumn(col.id, { decimals: Number(e.target.value) })}
                            className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 font-[JetBrains_Mono,monospace] focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                        </div>
                      </div>
                    )}

                    {col.type === 'boolean' && (
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">
                          True Probability: {col.truePercent}%
                        </label>
                        <input type="range" min={0} max={100} value={col.truePercent}
                          onChange={e => updateColumn(col.id, { truePercent: Number(e.target.value) })}
                          className="w-full accent-cyan-500" />
                        <div className="flex justify-between text-[10px] text-dark-500 mt-1">
                          <span>Always False</span><span>Always True</span>
                        </div>
                      </div>
                    )}

                    {col.type === 'date' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Start Date</label>
                          <input type="date" value={col.dateStart} onChange={e => updateColumn(col.id, { dateStart: e.target.value })}
                            className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">End Date</label>
                          <input type="date" value={col.dateEnd} onChange={e => updateColumn(col.id, { dateEnd: e.target.value })}
                            className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 focus:ring-1 focus:ring-cyan-500/50 outline-none" />
                        </div>
                      </div>
                    )}

                    {col.type === 'select' && (
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Options</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {col.options.map((opt, oi) => (
                            <span key={oi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-700 text-dark-200 text-[12px] font-medium ring-1 ring-dark-600">
                              {opt}
                              <button onClick={() => removeOption(col.id, 'options', oi)} className="text-dark-500 hover:text-red-400 ml-0.5">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newOptionText[`${col.id}_options`] || ''}
                            onChange={e => setNewOptionText(prev => ({ ...prev, [`${col.id}_options`]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addOption(col.id, 'options')}
                            placeholder="Add option..."
                            className="flex-1 rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                          />
                          <button onClick={() => addOption(col.id, 'options')}
                            className="px-3 py-2 rounded-lg bg-cyan-500/15 text-cyan-400 text-sm font-medium border border-cyan-500/30 hover:bg-cyan-500/25 transition-all">
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {col.type === 'text' && (
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1.5">Word Pool</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {col.textPool.map((word, wi) => (
                            <span key={wi} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-700 text-dark-200 text-[12px] font-medium ring-1 ring-dark-600">
                              {word}
                              <button onClick={() => removeOption(col.id, 'textPool', wi)} className="text-dark-500 hover:text-red-400 ml-0.5">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newOptionText[`${col.id}_textPool`] || ''}
                            onChange={e => setNewOptionText(prev => ({ ...prev, [`${col.id}_textPool`]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addOption(col.id, 'textPool')}
                            placeholder="Add word..."
                            className="flex-1 rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                          />
                          <button onClick={() => addOption(col.id, 'textPool')}
                            className="px-3 py-2 rounded-lg bg-cyan-500/15 text-cyan-400 text-sm font-medium border border-cyan-500/30 hover:bg-cyan-500/25 transition-all">
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {col.type === 'formula' && (
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Formula Expression</label>
                        <input
                          type="text"
                          value={col.formula}
                          onChange={e => updateColumn(col.id, { formula: e.target.value })}
                          placeholder="e.g. {amount} * 1.08 or {quantity} * {price}"
                          className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2.5 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 outline-none font-[JetBrains_Mono,monospace]"
                        />
                        <p className="text-[10px] text-dark-500 mt-1.5">
                          Use <code className="text-cyan-400/80 bg-dark-700 px-1 rounded">{'{columnName}'}</code> to reference other columns.
                          Supports +, -, *, /, and parentheses.
                        </p>
                      </div>
                    )}

                    {/* Prefix / Suffix / Null */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-dark-700/50">
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Prefix</label>
                        <input type="text" value={col.prefix} onChange={e => updateColumn(col.id, { prefix: e.target.value })}
                          placeholder="e.g. $"
                          className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 outline-none font-[JetBrains_Mono,monospace]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Suffix</label>
                        <input type="text" value={col.suffix} onChange={e => updateColumn(col.id, { suffix: e.target.value })}
                          placeholder="e.g. %"
                          className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/50 outline-none font-[JetBrains_Mono,monospace]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-1">Null %</label>
                        <input type="number" min={0} max={100} value={col.nullPercent}
                          onChange={e => updateColumn(col.id, { nullPercent: Number(e.target.value) })}
                          className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-sm text-dark-100 focus:ring-1 focus:ring-cyan-500/50 outline-none font-[JetBrains_Mono,monospace]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Column Button */}
          <button
            onClick={addColumn}
            className="w-full py-4 rounded-xl border-2 border-dashed border-dark-600 hover:border-cyan-500/30 text-dark-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 hover:bg-cyan-500/5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold text-sm">Add Column</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50 bg-dark-800/50">
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-dark-300 bg-dark-750 border border-dark-600 hover:text-dark-200 hover:bg-dark-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-[0.98]"
            >
              Apply {localColumns.filter(c => c.enabled && c.name.trim()).length} Column{localColumns.filter(c => c.enabled && c.name.trim()).length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
