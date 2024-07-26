FROM node:lts AS react-builder

WORKDIR /app

COPY todo-react/package*.json ./

RUN npm install

COPY ./todo-react ./
RUN npm run build


FROM golang:latest AS builder
LABEL authors="dave"

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /todo-go

FROM alpine:latest

COPY --from=builder /todo-go .
COPY --from=react-builder /app/build /build
RUN mkdir tmp/kube

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint to the script
ENTRYPOINT ["/entrypoint.sh"]

CMD ["/todo-go"]
