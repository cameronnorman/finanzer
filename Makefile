setup: build dependencies

dependencies:
	docker-compose run --rm app npm install --include=dev

build:
	docker-compose build app

shell:
	docker-compose run --rm app ash

start:
	docker-compose up

spec:
	docker-compose run --rm app npm test

prod_build:
	docker build . -t finanzer:0.0.1
