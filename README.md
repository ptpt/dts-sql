# dts-sql

A simple command line tool that generates TypeScript definition (`*.d.ts`) from SQL schema. Currently it only supports PostgreSQL.


## Usage

```
usage: dts-sql DB_URI SCHEMA TABLE INTERFACE_NAME

DB_URI: Database URI
SCHEMA: Table schema
TABLE: From which table to generate the definition
INTERFACE_NAME: Interface name of the definition
```

## Example

Assume we have had [the sample tables](https://github.com/vrajmohan/pgsql-sample-data/blob/master/employee/employees.sql) loaded the database. We want to generate the definition for the `employees` table:
```
dts-sql postgresql://postgres:secret@localhost:5432/postgres public employees IEmployee
```

will print out:
```
export interface IEmployee {

    // integer
    emp_no: number;

    // date
    birth_date: Date;

    // character varying
    first_name: string;

    // character varying
    last_name: string;

    // gender
    gender: any | null;

    // date
    hire_date: Date;
}
```

## License
MIT