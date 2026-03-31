.PHONY: help setup-backend setup-frontend dev-backend dev-frontend dev seed docker-up docker-down

help:
	@echo "Uzloads TMS — Available Commands"
	@echo ""
	@echo "  make setup-backend    Install Python deps & run migrations"
	@echo "  make setup-frontend   Install Node deps"
	@echo "  make dev-backend      Start FastAPI dev server (port 8000)"
	@echo "  make dev-frontend     Start Vite dev server (port 5173)"
	@echo "  make seed             Seed sample data into the database"
	@echo "  make docker-up        Start all services via Docker Compose"
	@echo "  make docker-down      Stop Docker Compose services"

setup-backend:
	cd backend && python -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt && \
	cp -n .env.example .env || true && \
	alembic upgrade head
	@echo "✅ Backend ready. Edit backend/.env with your settings."

setup-frontend:
	cd frontend && npm install && cp -n .env.example .env || true
	@echo "✅ Frontend ready."

dev-backend:
	cd backend && . venv/bin/activate && uvicorn main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

seed:
	cd backend && . venv/bin/activate && python seed.py

docker-up:
	docker compose up --build -d
	@echo "✅ Uzloads running at http://localhost"

docker-down:
	docker compose down
