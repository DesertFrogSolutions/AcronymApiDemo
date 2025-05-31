# We start by defining the path to this Makefile by parsing MAKEFILE_LIST.
# This allows referring to dependencies in a precise way
THIS_MAKEFILE_PATH:=$(abspath $(lastword $(MAKEFILE_LIST)))
LOCAL_BASE_PATH:=$(patsubst %/,%,$(dir $(THIS_MAKEFILE_PATH)))

package: dist.zip ## Generate Zipfile
.PHONY: package

PACKAGE_DEPS:=package.json package-lock.json .dockerignore Dockerfile docker-compose.yml initdb.sql example.config.json README.md $(wildcard src/*.js)
dist.zip: ${PACKAGE_DEPS}
	zip -r $@ $^

pkg: ${PACKAGE_DEPS} ## Generate npm package (tarball)
	npm pkg

clean:
	$(RM) -r node_modules
	$(RM) dist.zip
.PHONY: clean

start-session-dev: .tmux.conf
	tmux new -s AcronymAPI -c "$(shell pwd)" \; source-file -v $<
.PHONY: start-session-dev

attach-session-dev: .tmux.conf
	tmux attach -t AcronymAPI
.PHONY: attach-session-dev
