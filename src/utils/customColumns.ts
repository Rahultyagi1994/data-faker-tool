import { SeededRandom } from './fakerData';

export interface CustomColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'formula';
  enabled: boolean;
  options: string[];       // for select type
  textPool: string[];      // for text type
  minValue: number;        // for number type
  maxValue: number;        // for number type
  decimals: number;        // for number type
  truePercent: number;     // for boolean type
  dateStart: string;       // for date type
  dateEnd: string;         // for date type
  formula: string;         // for formula type
  prefix: string;
  suffix: string;
  nullPercent: number;
}

export function createDefaultColumn(): CustomColumn {
  return {
    id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    type: 'text',
    enabled: true,
    options: ['Option A', 'Option B', 'Option C'],
    textPool: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'],
    minValue: 0,
    maxValue: 100,
    decimals: 0,
    truePercent: 50,
    dateStart: '2020-01-01',
    dateEnd: '2024-12-31',
    formula: '',
    prefix: '',
    suffix: '',
    nullPercent: 0,
  };
}

export function applyCustomColumns(
  data: Record<string, unknown>[],
  columns: CustomColumn[],
  seed: number
): Record<string, unknown>[] {
  const enabledCols = columns.filter(c => c.enabled && c.name.trim());
  if (enabledCols.length === 0) return data;

  const rng = new SeededRandom(seed + 9999);

  return data.map((row, rowIndex) => {
    const newRow = { ...row };

    for (const col of enabledCols) {
      // Check null
      if (col.nullPercent > 0 && rng.next() * 100 < col.nullPercent) {
        newRow[col.name] = null;
        continue;
      }

      let value: unknown;

      switch (String(col.type).toLowerCase()) {
        case 'text':
          if (col.textPool.length > 0) {
            value = col.textPool[rng.nextInt(0, col.textPool.length - 1)];
          } else {
            value = `text_${rowIndex + 1}`;
          }
          break;

        case 'number':
          if (col.decimals > 0) {
            const raw = col.minValue + rng.next() * (col.maxValue - col.minValue);
            value = Number(raw.toFixed(col.decimals));
          } else {
            value = rng.nextInt(col.minValue, col.maxValue);
          }
          break;

        case 'boolean':
          value = rng.next() * 100 < col.truePercent;
          break;

        case 'date': {
          const start = new Date(col.dateStart || '2020-01-01').getTime();
          const end = new Date(col.dateEnd || '2024-12-31').getTime();
          const randomTime = start + rng.next() * (end - start);
          value = new Date(randomTime).toISOString().split('T')[0];
          break;
        }

        case 'select':
          if (col.options.length > 0) {
            value = col.options[rng.nextInt(0, col.options.length - 1)];
          } else {
            value = '';
          }
          break;

        case 'formula':
          try {
            let expr = col.formula;
            // Replace {fieldName} with actual values
            const matches = expr.match(/\{([^}]+)\}/g);
            if (matches) {
              for (const match of matches) {
                const fieldName = match.slice(1, -1);
                const fieldVal = newRow[fieldName];
                expr = expr.replace(match, String(fieldVal ?? 0));
              }
            }
            // Simple math eval (safe subset)
            value = safeEval(expr);
          } catch {
            value = 'ERR';
          }
          break;

        default:
          value = `val_${rowIndex}`;
      }

      // Apply prefix/suffix
      if (col.prefix || col.suffix) {
        newRow[col.name] = `${col.prefix}${value}${col.suffix}`;
      } else {
        newRow[col.name] = value;
      }
    }

    return newRow;
  });
}

function safeEval(expr: string): number {
  // Only allow numbers, basic math operators, parentheses, and decimals
  const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
  if (!sanitized.trim()) return 0;
  try {
    const fn = new Function(`return (${sanitized})`);
    const result = fn();
    return typeof result === 'number' && isFinite(result) ? Number(result.toFixed(4)) : 0;
  } catch {
    return 0;
  }
}
