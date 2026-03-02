.PHONY: up down build dev install logs clean test

# Start all services
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Build images
build:
	docker compose build

# Development mode (no docker)
dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

# Install dependencies
install:
	cd backend && npm install
	cd frontend && npm install

# Run tests
test-backend:
	cd backend && npm test

test-frontend:
	cd frontend && npm test -- --run

test: test-backend test-frontend

# View logs
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

# Clean up
clean:
	docker compose down -v
	docker system prune -f

# Database shell
mongo-shell:
	docker compose exec mongodb mongosh -u skillswap -p skillswap123 skillswap

postgres-shell:
	docker compose exec postgres psql -U skillswap -d skillswap_credits

redis-shell:
	docker compose exec redis redis-cli

# Health check
health:
	curl -s http://localhost/health | python3 -m json.tool
