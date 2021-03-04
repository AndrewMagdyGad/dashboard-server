# start with node  base image
FROM node:10.16.3

# Create an app directory (in the Docker container)
RUN mkdir -p /app
COPY . /app

WORKDIR /app

# install dependencies
RUN npm install --silent
RUN npm run build
# expose it from Docker container
EXPOSE 8080

# Finally start the container command
CMD ["npm", "run", "start:prod"]
