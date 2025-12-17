# Menggunakan Node.js versi ringan
FROM node:18-alpine

# Folder kerja di dalam "komputer" Docker
WORKDIR /app

# Copy daftar belanjaan (package.json) dulu biar install cepat
COPY package*.json ./

# Install semua library
RUN npm install

# Copy sisa kode backend
COPY . .

# Buka jalur komunikasi port 5000 (sesuai server.js kamu)
EXPOSE 5000

# Perintah untuk menyalakan server
CMD ["node", "server.js"]