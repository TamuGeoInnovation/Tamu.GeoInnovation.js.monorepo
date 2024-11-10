#!/bin/bash

echo "Running token substitution at runtime"

# Run the token substitution
/usr/local/bin/tokenSubstitute.sh

# Start nginx after substitution
exec nginx -g "daemon off;"
