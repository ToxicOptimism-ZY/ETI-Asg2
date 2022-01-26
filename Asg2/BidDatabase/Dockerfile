# syntax=docker/dockerfile:1

FROM mysql:latest

# Set destination for COPY
WORKDIR /app


# Copy the source code. Note the slash at the end
COPY CreateBidDatabase.sh /BidDatabase/CreateBidDatabase.sh
COPY CreateBidDatabase.sql /BidDatabase/CreateBidDatabase.sql
RUN /BidDatabase/CreateBidDatabase.sh

# Build
RUN go build -o /asg2-biddatabase

# This is for documentation purposes only.
# To actually open the port, runtime parameters
# must be supplied to the docker command.
EXPOSE 9229

# (Optional) environment variable that our dockerised
# application can make use of. The value of environment
# variables can also be set via parameters supplied
# to the docker command on the command line.
#ENV HTTP_PORT=8081

# Run
CMD [ "/asg2-biddatabase" ]