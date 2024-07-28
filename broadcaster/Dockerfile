FROM golang:latest AS builder
LABEL authors="djblackett"

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /broadcaster

FROM alpine:latest

COPY --from=builder /broadcaster .

CMD ["./broadcaster"]