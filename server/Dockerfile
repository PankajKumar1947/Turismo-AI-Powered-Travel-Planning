FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 5000

CMD [ "pnpm", "dev" ]


# RUN THESE COMMAND IN THE TERMINAL
# now build the image using this dockerfile
# docker build -t turismo-server .
# this will make the docker image we can push this to docker hub


# exposing the port by starting the container
# docker run -p 5000:5000 turismo-server