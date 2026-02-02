FROM nginx:alpine
COPY inicio.html login.html index.html styles.css manifest.json sw.js 1.jpeg 3.jpeg 3.png /usr/share/nginx/html/
EXPOSE 80
