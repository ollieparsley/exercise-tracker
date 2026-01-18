.PHONY: install lint format typecheck test test-e2e build ci dev preview run

install:
	npm install

lint:
	npx eslint src tests --max-warnings 0

format:
	npx prettier --check "src/**/*.{ts,tsx}" "tests/**/*.ts"

format-fix:
	npx prettier --write "src/**/*.{ts,tsx}" "tests/**/*.ts"

typecheck:
	npx tsc --noEmit

test:
	npx vitest run

test-watch:
	npx vitest

test-coverage:
	npx vitest run --coverage

test-e2e:
	npx playwright test

test-e2e-ui:
	npx playwright test --ui

build:
	npm run build

dev:
	npm run dev

preview:
	npm run preview

ci: lint format typecheck test build

run: build
	npm run preview
