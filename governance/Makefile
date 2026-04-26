# API Agent-Readiness Linting
# Usage: make lint-api SPEC=path/to/your-spec.yaml
# Requires: npx (Node.js)

SPECTRAL_VERSION := 6.14.2
RULESET := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))/.spectral.yml

lint-api:
	@if [ -z "$(SPEC)" ]; then \
		echo "Usage: make lint-api SPEC=path/to/your-spec.yaml"; \
		exit 1; \
	fi
	npx @stoplight/spectral-cli@$(SPECTRAL_VERSION) lint $(SPEC) --ruleset $(RULESET)

lint-example:
	npx @stoplight/spectral-cli@$(SPECTRAL_VERSION) lint ../examples/after.yaml --ruleset $(RULESET)

.PHONY: lint-api lint-example
