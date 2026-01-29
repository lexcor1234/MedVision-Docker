FROM nginx:alpine
COPY index.html styles.css manifest.json sw.js /usr/share/nginx/html/
EXPOSE 80
