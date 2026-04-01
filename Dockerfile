# build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build


# production stage
FROM node:22-alpine

WORKDIR /app

#  Use npm instead of pnpm for global tool (stable)
RUN npm install -g serve

# copy only build output
COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD [ "serve", "-s", "dist", "-l", "5173" ]

# now build the image using this dockerfile
# docker build -t turismo-client .
# this will make the docker image we can push this to docker hub


# exposing the port by starting the container
# docker run -p 5173:5173 turismo-client