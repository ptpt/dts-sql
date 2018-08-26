#!/bin/sh

SECRET=keep_postgres_secret
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=$SECRET mdillon/postgis
psql postgresql://postgres:$SECRET@localhost:5432 -f tests/test.sql