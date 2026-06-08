FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm install

COPY backend/requirements.txt ./
RUN python3 -m venv /app/backend/venv
RUN /app/backend/venv/bin/pip install --upgrade pip
RUN /app/backend/venv/bin/pip install -r requirements.txt

COPY backend /app/backend

ENV NODE_ENV=production
ENV START_PYTHON_SERVER=true
ENV PYTHON_BIN=/app/backend/venv/bin/python
ENV PYTHON_PORT=5001
ENV PYTHON_URL=http://localhost:5001
ENV MPLCONFIGDIR=/tmp/matplotlib

EXPOSE 10000

CMD ["npm", "start"]
