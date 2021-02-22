dependencies:
	docker-compose run --rm app npm install --include=dev --prefix=/app

build:
	docker-compose build app

setup: build dependencies

shell:
	docker-compose run --rm app ash

start:
	docker-compose up

spec:
	docker-compose run --rm app npm test

prod_build:
	docker build . -t finanzer:0.0.1
