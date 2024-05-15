# ---- Front-end Stage ----
FROM node:14 AS frontend

WORKDIR /app

COPY frontend/ ./frontend
COPY assets/ ./assets

WORKDIR /app/frontend
RUN npm install
RUN npm run build
RUN rm -rf node_modules

# ---- Final Stage ----
FROM python:3.8-slim-buster AS final

WORKDIR /app/backend

# Install build dependencies
RUN apt-get update && apt-get install -y \
  gcc \
  python3-dev \
  libffi-dev \
  libssl-dev \
  && rm -rf /var/lib/apt/lists/*

COPY backend/ ./

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Copy build artifacts from frontend stage
COPY --from=frontend /app/frontend/dist /app/frontend/dist

WORKDIR /app

# Install gunicorn
RUN pip3 install gunicorn

# Expose port for the Flask app to run on
EXPOSE 5000

CMD ["gunicorn", "backend.app:app", "-b", "0.0.0.0:5000", "--timeout", "600"]

