#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg = __importStar(require("pg"));
const squel = __importStar(require("squel"));
const test = () => __awaiter(this, void 0, void 0, function* () {
    const [connectionString] = process.argv.slice(2);
    const pool = new pg.Pool({
        connectionString: connectionString,
    });
    const s = squel.useFlavour('postgres').select().from('dts_sql_test');
    const q = s.toParam();
    const result = yield pool.query(q.text, q.values);
    console.log(result.rows[0]);
});
test().then(() => {
    process.exit(0);
}).catch((e) => {
    console.error(e.message);
    process.exit(1);
});
