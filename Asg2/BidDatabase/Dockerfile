# syntax=docker/dockerfile:1

# Derived from official mysql image (our base image)
FROM mysql

# Set destination for COPY
WORKDIR /app

# Add the content of the sql-scripts/ directory to your image
# All scripts in docker-entrypoint-initdb.d/ are automatically
# executed during container startup
COPY ./CreateBidDatabase.sql /docker-entrypoint-initdb.d/

# This is for documentation purposes only.
# To actually open the port, runtime parameters
# must be supplied to the docker command.
EXPOSE 9229