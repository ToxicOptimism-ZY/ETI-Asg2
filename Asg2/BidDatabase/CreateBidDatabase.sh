set -e
service mysql start
mysql < CreateBidDatabase.sql
service mysql stop