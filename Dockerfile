FROM nginx:alpine
COPY welcome.html login.html index.html styles.css manifest.json sw.js 1.jpeg 3.jpeg 3.png /usr/share/nginx/html/
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/app.html && \
    mv /usr/share/nginx/html/welcome.html /usr/share/nginx/html/index.html && \
    mv /usr/share/nginx/html/login.html /usr/share/nginx/html/inicio.html
EXPOSE 80
