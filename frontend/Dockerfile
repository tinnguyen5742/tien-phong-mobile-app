# Sử dụng image Nginx chính thức
FROM nginx:alpine

# Copy file APK và JSON vào thư mục web của Nginx
COPY ./android/app/build/outputs/apk/release/app-release.apk /usr/share/nginx/html/
COPY updater.json /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
