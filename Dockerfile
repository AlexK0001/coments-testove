# 1. Вказуємо базовий образ Node.js
FROM node:20

# 2. Встановлюємо робочу директорію в контейнері
WORKDIR /app

# 3. Копіюємо package.json та package-lock.json
COPY package*.json ./

# 4. Встановлюємо залежності
RUN npm install

# 5. Копіюємо весь код у контейнер
COPY . .

# 6. Відкриваємо порт, на якому працює бекенд
EXPOSE 3001

# 7. Команда запуску
CMD ["npm", "start"]
