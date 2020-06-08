#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg = __importStar(require("pg"));
const squel = __importStar(require("squel"));
const help_message = `
usage: dts-sql DB_URI SCHEMA TABLE INTERFACE_NAME

DB_URI: Database URI
SCHEMA: Table schema
TABLE: From which table to generate the definition
INTERFACE_NAME: Interface name of the definition
`;
const getTSType = (sqlType) => {
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
    }
    else if (0 <= stringTypes.indexOf(sqlType)) {
        return 'string';
    }
    else if (0 <= dateTypes.indexOf(sqlType)) {
        return 'Date';
    }
    else if (sqlType === 'boolean') {
        return 'boolean';
    }
    else if (sqlType === 'bytea') {
        return 'Buffer';
    }
    else if (sqlType === 'interval') {
        // return 'PostgresInterval';
        return 'any';
    }
    else if (sqlType.endsWith('[]')) {
        const baseType = getTSType(sqlType.slice(0, sqlType.length - 2));
        return `${baseType}[]`;
    }
    else {
        return 'any';
    }
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield pool.query(q.text, q.values);
    const defs = result.rows.map(row => {
        const { column_name, type: sqlType, is_nullable } = row;
        const nullable = is_nullable === 'YES' ? ' | null' : '';
        const tsType = getTSType(sqlType);
        return `
    // ${sqlType}
    '${column_name}': ${tsType}${nullable};`;
    });
    console.log(`export interface ${interfaceName} {\n${defs.join('\n')}\n}`);
    return 0;
});
main().then((statusCode) => {
    process.exit(statusCode);
}).catch((e) => {
    console.error(e.message);
    process.exit(1);
});
