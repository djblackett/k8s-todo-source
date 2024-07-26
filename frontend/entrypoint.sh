#!/bin/sh

# Print debug information
echo "Running entrypoint.sh"
echo "Replacing __API_URL__ with ${API_URL}"

# Replace placeholders in config.js with environment variables
sed -i "s|__API_URL__|${API_URL}|g" /build/config.js

# Check if the replacement was successful
echo "Contents of /build/config.js after replacement:"
cat /build/config.js

# Start the main process
exec "$@"
