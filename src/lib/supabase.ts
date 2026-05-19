import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

// ── Supabase 쿼리 빌더 호환 레이어 ──────────────────────────────
// 기존 supabase.from('table').select().eq().order().limit() 패턴을 유지

type Row = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = Promise<{ data: any; error: { message: string; code?: string } | null }>;

class QueryBuilder {
  private _table: string;
  private _cols = '*';
  private _wheres: string[] = [];
  private _orders: string[] = [];
  private _limit?: number;
  private _offset?: number;
  private _values: unknown[] = [];
  private _action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private _insertData?: Row | Row[];
  private _updateData?: Row;
  private _single = false;

  constructor(table: string) {
    this._table = table;
  }

  select(cols = '*') {
    // insert/update 뒤에 select()가 오면 RETURNING 절 용도로만 사용
    if (this._action === 'insert' || this._action === 'update') {
      this._cols = cols;
    } else {
      this._cols = cols; this._action = 'select';
    }
    return this;
  }

  insert(data: Row | Row[]) {
    this._action = 'insert'; this._insertData = data; return this;
  }

  update(data: Row) {
    this._action = 'update'; this._updateData = data; return this;
  }

  delete() { this._action = 'delete'; return this; }

  eq(col: string, val: unknown) {
    this._values.push(val);
    this._wheres.push(`"${col}" = $${this._values.length}`);
    return this;
  }

  neq(col: string, val: unknown) {
    this._values.push(val);
    this._wheres.push(`"${col}" != $${this._values.length}`);
    return this;
  }

  in(col: string, vals: unknown[]) {
    const placeholders = vals.map((v, i) => { this._values.push(v); return `$${this._values.length}`; });
    this._wheres.push(`"${col}" IN (${placeholders.join(',')})`);
    return this;
  }

  // ilike 패턴: title.ilike.%q%, content.ilike.%q%
  or(conditions: string) {
    const parts = conditions.split(',').map(cond => {
      const m = cond.match(/^(\w+)\.(ilike|like|eq)\.(.+)$/);
      if (!m) return '1=1';
      const [, col, op, val] = m;
      this._values.push(val);
      const n = this._values.length;
      if (op === 'ilike') return `"${col}" ILIKE $${n}`;
      if (op === 'like')  return `"${col}" LIKE $${n}`;
      return `"${col}" = $${n}`;
    });
    this._wheres.push(`(${parts.join(' OR ')})`);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? 'DESC' : opts?.ascending === true ? 'ASC' : 'DESC';
    this._orders.push(`"${col}" ${dir} NULLS LAST`);
    return this;
  }

  limit(n: number) { this._limit = n; return this; }
  offset(n: number) { this._offset = n; return this; }

  range(from: number, to: number) {
    this._offset = from;
    this._limit = to - from + 1;
    return this;
  }

  single() { this._single = true; return this; }

  // image_ok IS NOT FALSE (null 포함해서 true 취급)
  imageOkOnly() {
    this._wheres.push(`("image_ok" IS NULL OR "image_ok" = TRUE)`);
    return this;
  }

  // published IS NOT FALSE (null·true 모두 발행된 것으로 취급)
  publishedOnly() {
    this._wheres.push(`("published" IS NULL OR "published" = TRUE)`);
    return this;
  }

  // published = FALSE 인 초안만
  draftOnly() {
    this._wheres.push(`"published" = FALSE`);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then(resolve: (v: { data: any; error: { message: string; code?: string } | null }) => void) {
    return this._run().then(resolve);
  }

  private async _run(): Result {
    try {
      const where = this._wheres.length ? `WHERE ${this._wheres.join(' AND ')}` : '';

      if (this._action === 'select') {
        let q = `SELECT ${this._cols} FROM "${this._table}" ${where}`;
        if (this._orders.length) q += ` ORDER BY ${this._orders.join(', ')}`;
        if (this._limit  != null) q += ` LIMIT ${this._limit}`;
        if (this._offset != null) q += ` OFFSET ${this._offset}`;
        const rows = await sql.unsafe(q, this._values as never[]) as Row[];
        if (this._single) return { data: rows[0] ?? null, error: null };
        return { data: rows, error: null };
      }

      if (this._action === 'insert') {
        const rows = Array.isArray(this._insertData) ? this._insertData : [this._insertData!];
        const cols = Object.keys(rows[0]);
        const colList = cols.map(c => `"${c}"`).join(', ');
        const results: Row[] = [];
        for (const row of rows) {
          const vals = cols.map(c => row[c]);
          const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
          const returning = this._cols && this._cols !== '*'
            ? this._cols.split(',').map(c => `"${c.trim()}"`).join(', ')
            : '*';
          const [inserted] = await sql.unsafe(
            `INSERT INTO "${this._table}" (${colList}) VALUES (${placeholders}) RETURNING ${returning}`,
            vals as never[]
          ) as Row[];
          results.push(inserted);
        }
        if (this._single) return { data: results[0] ?? null, error: null };
        return { data: results, error: null };
      }

      if (this._action === 'update') {
        const entries = Object.entries(this._updateData!);
        const setClause = entries.map(([k], i) => {
          this._values.unshift(); // reorder below
          return `"${k}" = $${i + 1}`;
        }).join(', ');
        const updateVals = [...entries.map(([, v]) => v), ...this._values];
        // rebuild where with shifted indices
        const shiftedWhere = this._wheres.length
          ? `WHERE ${this._wheres.map(w => w.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + entries.length}`)
          ).join(' AND ')}`
          : '';
        await sql.unsafe(
          `UPDATE "${this._table}" SET ${setClause} ${shiftedWhere}`,
          updateVals as never[]
        );
        return { data: null, error: null };
      }

      if (this._action === 'delete') {
        await sql.unsafe(`DELETE FROM "${this._table}" ${where}`, this._values as never[]);
        return { data: null, error: null };
      }

      return { data: null, error: { message: 'Unknown action' } };
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      return { data: null, error: { message: err.message ?? String(e), code: err.code } };
    }
  }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
};

export { sql };
export default sql;
