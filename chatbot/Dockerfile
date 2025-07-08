# Dockerfile for Rasa chatbot
FROM rasa/rasa:3.6.0

WORKDIR /app

# Copy Rasa files
COPY . .

# Train the model
RUN rasa train

EXPOSE 5005

CMD ["rasa", "run", "--enable-api", "--cors", "*"]
