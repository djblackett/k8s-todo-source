FROM golang:latest as builder
LABEL authors="dave"

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /todo-server-go

FROM alpine:latest

COPY --from=builder /todo-server-go .

CMD ["./todo-server-go"]