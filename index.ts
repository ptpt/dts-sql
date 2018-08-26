#!/usr/bin/env node
import * as pg from 'pg';
import * as squel from 'squel';

const help_message = `
usage: dts-sql DB_URI SCHEMA TABLE INTERFACE_NAME

DB_URI: Database URI
SCHEMA: Table schema
TABLE: From which table to generate the definition
INTERFACE_NAME: Interface name of the definition
`

const getTSType = (sqlType: string): string => {
    const numberTypes = [
        'real',
        'smallint',
        'integer',
        'double precision',
    ];

    const stringTypes = [
        'bigint',
        'bit varying',
        'bit',
        'character varying',
        'character',
        'cidr',
        'daterange',
        'inet',
        'int4range',
        'int8range',
        'macaddr',
        'money',
        'numeric',
        'numrange',
        'text',
        'time with time zone',
        'time without time zone',
        'tsrange',
        'tstzrange',
        'tsvector',
        'uuid',
        'xml',
    ];

    const dateTypes = [
        'date',
        'timestamp without time zone',
        'timestamp with time zone',
    ];

    if (0 <= numberTypes.indexOf(sqlType)) {
        return 'number';
    } else if (0 <= stringTypes.indexOf(sqlType)) {
        return 'string';
    } else if (0 <= dateTypes.indexOf(sqlType)) {
        return 'Date';
    } else if (sqlType === 'boolean') {
        return 'boolean';
    } else if (sqlType === 'bytea') {
        return 'Buffer';
    } else if (sqlType === 'interval') {
        // return 'PostgresInterval';
        return 'any';
    } else if (sqlType.endsWith('[]')) {
        const baseType = getTSType(sqlType.slice(0, sqlType.length - 2));
        return `${baseType}[]`;
    } else {
        return 'any';
    }
}

interface Hello {
    interface: boolean;
    class: boolean;
    number: number;
    'hello world': number;
}

const main = async (): Promise<number> => {
    if (process.argv.length < 6) {
        console.error(help_message);
        return 1;
    }

    const [connectionString, schema, table, interfaceName] = process.argv.slice(2);

    const pool = new pg.Pool({
        connectionString: connectionString,
    });

    const s = squel.useFlavour('postgres')
        .select()
        .field('column_name')
        .field('udt_name::regtype', 'type')
        .field('is_nullable')
        .from('information_schema.columns')
        .where('table_schema = ?', schema)
        .where('table_name = ?', table);

    const q = s.toParam();
    const result = await pool.query(q.text, q.values);
    const defs: string[] = result.rows.map(
        row => {
            const {column_name, type, is_nullable} = row;
            const nullable = is_nullable === 'YES' ? ' | null' : '';
            return `
    // ${type}
    ${column_name}: ${getTSType(type)}${nullable};`
        }
    );
    console.log(`export interface ${interfaceName} {\n${defs.join('\n')}\n}`);
    return 0;
}

main().then(
    (statusCode) => {
        process.exit(statusCode);
    }
).catch(
    (e) => {
        console.error(e.message);
        process.exit(1);
    }
);