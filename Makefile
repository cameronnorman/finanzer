image=finanzer:0.0.27
docker_repo=${DOCKER_REPO}
docker_repo_username=${DOCKER_REPO_USERNAME}
docker_repo_password=${DOCKER_REPO_PASSWORD}
deploy_auth=${DEPLOY_AUTH}
deploy_action_url=${DEPLOY_ACTION_URL}

setup: build dependencies

dependencies:
	docker-compose run --rm app npm install --include=dev

build:
	docker-compose build app

shell:
	docker-compose run --rm app ash

start:
	docker-compose up

gendocs: rmdocs spec

rmdocs:
	rm -rf api-docs
	mkdir api-docs
	echo {} > api-docs/server.json

spec:
	rm -f test.sqlite
	rm -f uploads/*
	docker-compose run --rm app npm test

prod_spec:
	rm -f test.sqlite
	rm -f uploads/*
	cp .env.sample .env
	docker-compose run --rm app npm test

prod_shell:
	docker-compose -f docker-compose-prod.yml run --rm app ash

prod_run:
	docker-compose -f docker-compose-prod.yml up

prod_deploy: prod_build prod_push

prod_build:
	DOCKER_BUILDKIT=1 docker build . --target=prod -t $(image)

prod_push:
	docker login $(docker_repo) -u $(docker_repo_username) -p $(docker_repo_password)
	docker tag $(image) $(docker_repo)/$(image)
	docker push $(docker_repo)/$(image)

start_service:
	curl -v --location --request POST $(deploy_action_url) \
		--header 'Accept: application/vnd.github.v3+json' \
		--header 'Authorization: $(deploy_auth)' \
		--header 'Content-Type: application/json' \
		--data-raw '{"ref": "master","inputs": {"image_version": "$(image)"}}'
