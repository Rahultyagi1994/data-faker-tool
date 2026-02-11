import { useState } from 'react';
import { cn } from '../utils/cn';
import {
  PRESET_SCENARIOS,
  getCustomizableFields,
  type ScenarioConfig,
  type FieldRule,
  type PresetScenario,
} from '../utils/scenarios';

interface ScenarioBuilderProps {
  dataType: string;
  activeScenario: Partial<ScenarioConfig> | null;
  onApplyScenario: (scenario: Partial<ScenarioConfig> | null) => void;
  onClose: () => void;
}

export function ScenarioBuilder({ dataType, activeScenario, onApplyScenario, onClose }: ScenarioBuilderProps) {
  const [tab, setTab] = useState<'presets' | 'custom'>('presets');
  const [customConfig, setCustomConfig] = useState<Partial<ScenarioConfig>>(() => {
    if (activeScenario) return { ...activeScenario };
    return { nullRate: 0, duplicateRate: 0, errorRate: 0, fieldRules: {} };
  });
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [presetFilter, setPresetFilter] = useState<'all' | 'general' | 'healthcare' | 'edge-case'>('all');

  const availablePresets = PRESET_SCENARIOS.filter(
    p => p.dataTypes.includes(dataType) && (presetFilter === 'all' || p.category === presetFilter)
  );
  const customizableFields = getCustomizableFields(dataType);

  const getFieldRule = (field: string): FieldRule => {
    return customConfig.fieldRules?.[field] ?? { enabled: false };
  };

  const updateFieldRule = (field: string, updates: Partial<FieldRule>) => {
    setCustomConfig(prev => ({
      ...prev,
      fieldRules: {
        ...prev.fieldRules,
        [field]: { ...getFieldRule(field), ...updates },
      },
    }));
  };

  const handleApplyPreset = (preset: PresetScenario) => {
    onApplyScenario(preset.config);
  };

  const handleApplyCustom = () => {
    // Clean up: remove disabled field rules
    const cleanRules: Record<string, FieldRule> = {};
    if (customConfig.fieldRules) {
      for (const [k, v] of Object.entries(customConfig.fieldRules)) {
        if (v.enabled) cleanRules[k] = v;
      }
    }
    const clean: Partial<ScenarioConfig> = {
      ...customConfig,
      fieldRules: Object.keys(cleanRules).length > 0 ? cleanRules : undefined,
    };
    // Check if anything is actually configured
    const hasConfig =
      (clean.nullRate ?? 0) > 0 ||
      (clean.duplicateRate ?? 0) > 0 ||
      (clean.errorRate ?? 0) > 0 ||
      (clean.fieldRules && Object.keys(clean.fieldRules).length > 0);

    onApplyScenario(hasConfig ? clean : null);
  };

  const handleClear = () => {
    onApplyScenario(null);
    onClose();
  };

  const [customValueInput, setCustomValueInput] = useState<Record<string, string>>({});

  const addCustomValue = (field: string) => {
    const val = customValueInput[field]?.trim();
    if (!val) return;
    const existing = getFieldRule(field).customValues ?? [];
    if (!existing.includes(val)) {
      updateFieldRule(field, { customValues: [...existing, val], enabled: true });
    }
    setCustomValueInput(prev => ({ ...prev, [field]: '' }));
  };

  const removeCustomValue = (field: string, index: number) => {
    const existing = getFieldRule(field).customValues ?? [];
    updateFieldRule(field, { customValues: existing.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-dark-600 bg-dark-900 shadow-2xl shadow-black/50 flex flex-col animate-float-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/50 bg-dark-850/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-lg">🎬</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Custom Scenarios</h2>
              <p className="text-[11px] text-dark-400">Define data patterns, edge cases, and custom constraints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeScenario && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[12px] font-medium border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                ✕ Clear Scenario
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-200 hover:bg-dark-750 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-700/50 px-6 flex-shrink-0 bg-dark-850/40">
          {[
            { key: 'presets' as const, label: 'Preset Scenarios', icon: '⚡', count: availablePresets.length },
            { key: 'custom' as const, label: 'Custom Builder', icon: '🔧' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-[13px] font-semibold border-b-2 transition-all -mb-[1px]',
                tab === t.key
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-dark-400 border-transparent hover:text-dark-200 hover:border-dark-500'
              )}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.count !== undefined && (
                <span className="bg-dark-700 text-dark-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'presets' ? (
            <div>
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[
                  { key: 'all' as const, label: 'All', icon: '🌐' },
                  { key: 'general' as const, label: 'General', icon: '📊' },
                  { key: 'healthcare' as const, label: 'Healthcare', icon: '🏥' },
                  { key: 'edge-case' as const, label: 'Edge Cases', icon: '🔬' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setPresetFilter(f.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border',
                      presetFilter === f.key
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-dark-800 text-dark-400 border-dark-650 hover:text-dark-200 hover:border-dark-500'
                    )}
                  >
                    <span>{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>

              {availablePresets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3 opacity-50">🔍</div>
                  <div className="text-sm font-medium text-dark-300">No presets available for this data type</div>
                  <div className="text-[12px] text-dark-500 mt-1">Try the Custom Builder tab to create your own rules</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePresets.map(preset => {
                    const isActive = activeScenario && JSON.stringify(activeScenario) === JSON.stringify(preset.config);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={cn(
                          'relative text-left rounded-xl border p-4 transition-all duration-200 group overflow-hidden',
                          isActive
                            ? 'border-cyan-500/40 bg-dark-800 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                            : 'border-dark-650 bg-dark-800/40 hover:border-dark-500 hover:bg-dark-800/70'
                        )}
                      >
                        {isActive && (
                          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', preset.color)} />
                        )}
                        <div className="relative">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{preset.icon}</span>
                              <div>
                                <div className={cn(
                                  'font-semibold text-sm',
                                  isActive ? 'text-white' : 'text-dark-100'
                                )}>{preset.name}</div>
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-glow flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-dark-400 leading-relaxed mt-1">{preset.description}</p>

                          {/* Config badges */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {preset.config.nullRate ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-medium ring-1 ring-amber-500/20">
                                {preset.config.nullRate}% nulls
                              </span>
                            ) : null}
                            {preset.config.duplicateRate ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-medium ring-1 ring-purple-500/20">
                                {preset.config.duplicateRate}% dupes
                              </span>
                            ) : null}
                            {preset.config.errorRate ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-medium ring-1 ring-red-500/20">
                                {preset.config.errorRate}% errors
                              </span>
                            ) : null}
                            {preset.config.fieldRules && Object.keys(preset.config.fieldRules).length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-medium ring-1 ring-cyan-500/20">
                                {Object.keys(preset.config.fieldRules).length} field rules
                              </span>
                            )}
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ring-1',
                              preset.category === 'healthcare'
                                ? 'bg-teal-500/10 text-teal-400 ring-teal-500/20'
                                : preset.category === 'edge-case'
                                ? 'bg-orange-500/10 text-orange-400 ring-orange-500/20'
                                : 'bg-blue-500/10 text-blue-400 ring-blue-500/20'
                            )}>
                              {preset.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Settings */}
              <div className="rounded-xl border border-dark-650 bg-dark-850/60 p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-base">⚙️</span>
                  Global Data Quality Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">
                      Null Rate
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={80}
                        value={customConfig.nullRate ?? 0}
                        onChange={e => setCustomConfig(prev => ({ ...prev, nullRate: parseInt(e.target.value) }))}
                        className="flex-1 accent-amber-500 h-1.5 bg-dark-700 rounded-full cursor-pointer"
                      />
                      <span className="text-[13px] font-[JetBrains_Mono,monospace] text-amber-400 w-10 text-right">
                        {customConfig.nullRate ?? 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-dark-500 mt-1">Random fields set to null</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">
                      Duplicate Rate
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={customConfig.duplicateRate ?? 0}
                        onChange={e => setCustomConfig(prev => ({ ...prev, duplicateRate: parseInt(e.target.value) }))}
                        className="flex-1 accent-purple-500 h-1.5 bg-dark-700 rounded-full cursor-pointer"
                      />
                      <span className="text-[13px] font-[JetBrains_Mono,monospace] text-purple-400 w-10 text-right">
                        {customConfig.duplicateRate ?? 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-dark-500 mt-1">Rows duplicated randomly</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-dark-400 uppercase tracking-wider mb-2">
                      Error Rate
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={customConfig.errorRate ?? 0}
                        onChange={e => setCustomConfig(prev => ({ ...prev, errorRate: parseInt(e.target.value) }))}
                        className="flex-1 accent-red-500 h-1.5 bg-dark-700 rounded-full cursor-pointer"
                      />
                      <span className="text-[13px] font-[JetBrains_Mono,monospace] text-red-400 w-10 text-right">
                        {customConfig.errorRate ?? 0}%
                      </span>
                    </div>
                    <p className="text-[10px] text-dark-500 mt-1">Garbled/malformed values</p>
                  </div>
                </div>
              </div>

              {/* Field-Level Rules */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-base">🎛️</span>
                  Field-Level Rules
                  <span className="text-[10px] font-medium text-dark-500 bg-dark-750 px-2 py-0.5 rounded-full ml-1">
                    {customizableFields.length} fields
                  </span>
                </h3>

                <div className="space-y-2">
                  {customizableFields.map(field => {
                    const rule = getFieldRule(field.key);
                    const isExpanded = expandedField === field.key;
                    const hasRules = rule.enabled && (
                      rule.fixedValue || (rule.customValues && rule.customValues.length > 0) ||
                      rule.minValue !== undefined || rule.maxValue !== undefined ||
                      rule.dateStart || rule.dateEnd || (rule.nullPercent && rule.nullPercent > 0)
                    );

                    return (
                      <div
                        key={field.key}
                        className={cn(
                          'rounded-xl border transition-all duration-200',
                          rule.enabled
                            ? 'border-cyan-500/20 bg-dark-850/80'
                            : 'border-dark-650 bg-dark-850/40'
                        )}
                      >
                        {/* Field header */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer group"
                          onClick={() => setExpandedField(isExpanded ? null : field.key)}
                        >
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              updateFieldRule(field.key, { enabled: !rule.enabled });
                              if (!rule.enabled) setExpandedField(field.key);
                            }}
                            className={cn(
                              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                              rule.enabled
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                : 'border-dark-500 hover:border-dark-400'
                            )}
                          >
                            {rule.enabled && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'text-[13px] font-semibold',
                                rule.enabled ? 'text-white' : 'text-dark-200'
                              )}>
                                {field.label}
                              </span>
                              <span className="text-[10px] font-[JetBrains_Mono,monospace] text-dark-500 bg-dark-750 px-1.5 py-0.5 rounded">
                                {field.key}
                              </span>
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
                                field.type === 'number' ? 'bg-blue-500/10 text-blue-400' :
                                field.type === 'date' ? 'bg-purple-500/10 text-purple-400' :
                                field.type === 'boolean' ? 'bg-emerald-500/10 text-emerald-400' :
                                field.type === 'status' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-dark-700 text-dark-400'
                              )}>
                                {field.type}
                              </span>
                            </div>
                          </div>

                          {hasRules && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/30" />
                          )}

                          <svg
                            className={cn(
                              'w-4 h-4 text-dark-500 transition-transform flex-shrink-0',
                              isExpanded ? 'rotate-180' : ''
                            )}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && rule.enabled && (
                          <div className="px-4 pb-4 pt-1 border-t border-dark-700/30 space-y-4 animate-float-in">
                            {/* Fixed Value */}
                            <div>
                              <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">
                                Fixed Value <span className="text-dark-600">(all rows get this value)</span>
                              </label>
                              <input
                                type={field.type === 'boolean' ? 'text' : 'text'}
                                value={rule.fixedValue ?? ''}
                                onChange={e => updateFieldRule(field.key, { fixedValue: e.target.value || undefined })}
                                placeholder={field.type === 'boolean' ? 'true or false' : 'Leave empty to skip'}
                                className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] font-[JetBrains_Mono,monospace] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all"
                              />
                            </div>

                            {/* Custom Values Pool */}
                            {(field.type === 'text' || field.type === 'status') && (
                              <div>
                                <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">
                                  Custom Value Pool <span className="text-dark-600">(pick randomly from these)</span>
                                </label>
                                <div className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={customValueInput[field.key] ?? ''}
                                    onChange={e => setCustomValueInput(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomValue(field.key); } }}
                                    placeholder="Add value and press Enter"
                                    className="flex-1 rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all"
                                  />
                                  <button
                                    onClick={() => addCustomValue(field.key)}
                                    className="px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-[12px] font-medium transition-all"
                                  >
                                    Add
                                  </button>
                                </div>
                                {rule.customValues && rule.customValues.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {rule.customValues.map((val, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-dark-700 text-dark-100 text-[11px] font-medium ring-1 ring-dark-600 group"
                                      >
                                        {val}
                                        <button
                                          onClick={() => removeCustomValue(field.key, idx)}
                                          className="p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-all text-dark-500"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Min/Max for numbers */}
                            {field.type === 'number' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">Min Value</label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={rule.minValue ?? ''}
                                    onChange={e => updateFieldRule(field.key, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="Min"
                                    className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] font-[JetBrains_Mono,monospace] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">Max Value</label>
                                  <input
                                    type="number"
                                    step="any"
                                    value={rule.maxValue ?? ''}
                                    onChange={e => updateFieldRule(field.key, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="Max"
                                    className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] font-[JetBrains_Mono,monospace] text-dark-100 placeholder:text-dark-500 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Date range */}
                            {field.type === 'date' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">Start Date</label>
                                  <input
                                    type="date"
                                    value={rule.dateStart ?? ''}
                                    onChange={e => updateFieldRule(field.key, { dateStart: e.target.value || undefined })}
                                    className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] text-dark-100 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all [color-scheme:dark]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">End Date</label>
                                  <input
                                    type="date"
                                    value={rule.dateEnd ?? ''}
                                    onChange={e => updateFieldRule(field.key, { dateEnd: e.target.value || undefined })}
                                    className="w-full rounded-lg border border-dark-600 bg-dark-750 px-3 py-2 text-[12px] text-dark-100 focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 outline-none transition-all [color-scheme:dark]"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Per-field null rate */}
                            <div>
                              <label className="block text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1.5">
                                Null % for this field
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={rule.nullPercent ?? 0}
                                  onChange={e => updateFieldRule(field.key, { nullPercent: parseInt(e.target.value) || undefined })}
                                  className="flex-1 accent-amber-500 h-1.5 bg-dark-700 rounded-full cursor-pointer"
                                />
                                <span className="text-[12px] font-[JetBrains_Mono,monospace] text-amber-400 w-10 text-right">
                                  {rule.nullPercent ?? 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50 bg-dark-850/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            {tab === 'custom' && (
              <div className="flex items-center gap-2 text-[11px] text-dark-400">
                {(customConfig.nullRate ?? 0) > 0 && (
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md ring-1 ring-amber-500/20">
                    {customConfig.nullRate}% nulls
                  </span>
                )}
                {(customConfig.duplicateRate ?? 0) > 0 && (
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md ring-1 ring-purple-500/20">
                    {customConfig.duplicateRate}% dupes
                  </span>
                )}
                {(customConfig.errorRate ?? 0) > 0 && (
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md ring-1 ring-red-500/20">
                    {customConfig.errorRate}% errors
                  </span>
                )}
                {customConfig.fieldRules && Object.values(customConfig.fieldRules).filter(r => r.enabled).length > 0 && (
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md ring-1 ring-cyan-500/20">
                    {Object.values(customConfig.fieldRules).filter(r => r.enabled).length} fields
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-dark-300 hover:text-dark-100 transition-all"
            >
              Cancel
            </button>
            {tab === 'custom' && (
              <button
                onClick={handleApplyCustom}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[13px] font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-[0.98]"
              >
                Apply Custom Scenario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
