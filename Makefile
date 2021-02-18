build:
	docker build . -t finanzer:0.0.1

shell:
	docker run --rm -it finanzer:0.0.1 bash

start:
	docker run --rm finanzer:0.0.1 node build/app.js
