package: dist.zip ## Generate Zipfile
.PHONY: package

PACKAGE_DEPS:=package.json package-lock.json .dockerignore Dockerfile docker-compose.yml initdb.sql example.config.json README.md $(wildcard src/*.js)
dist.zip: ${PACKAGE_DEPS}
	zip -r $@ $^

pkg: ${PACKAGE_DEPS} ## Generate npm package (tarball)
	npm pkg
