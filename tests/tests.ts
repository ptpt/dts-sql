#!/usr/bin/env node
import * as pg from 'pg';
import * as squel from 'squel';

const test = async () => {
    const [connectionString] = process.argv.slice(2);

    const pool = new pg.Pool({
        connectionString: connectionString,
    });

    const s = squel.useFlavour('postgres').select().from('dts_sql_test');
    const q = s.toParam();
    const result = await pool.query(q.text, q.values);
    console.log(result.rows[0]);
}

test().then(
    () => {
        process.exit(0);
    }
).catch(
    (e) => {
        console.error(e.message);
        process.exit(1);
    }
);