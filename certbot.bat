#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 
#  github.com/saasscaleup/nodejs-ssl-server

# https://mr-alien.medium.com/how-to-configure-pm2-the-right-way-11004871b5dc

#/etc/letsencrypt/live/dinagold.org/privkey.pem

sudo certbot --manual --preferred-challenges dns certonly -d dinagold.net 
#sudo certbot --manual --preferred-challenges dns certonly -d dinagold.org 
#sudo certbot --manual --preferred-challenges dns certonly -d portfolio-chk.com 

# 2024 Mar 4 namecheap/mange/advanced/add a new record

# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.net
# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.org

# @REM #_acme-challenge.dinagold.org

# @REM HTDNSNgIUZ9xRgvR_yu2t0L_IXcJR29VnkubPYq7rNo
 
/etc/letsencrypt/live/dinagold.org/cert.pem
/etc/letsencrypt/live/dinagold.org/privkey.pem
/etc/letsencrypt/live/dinagold.org/fullchain.pem
/etc/letsencrypt/live/dinagold.org/chain.pem
/etc/letsencrypt/live/dinagold.net/cert.pem
/etc/letsencrypt/live/dinagold.net/privkey.pem
/etc/letsencrypt/live/dinagold.net/fullchain.pem
/etc/letsencrypt/live/dinagold.net/chain.pem
/etc/letsencrypt/live/portfolio-chk.com/cert.pem
/etc/letsencrypt/live/portfolio-chk.com/privkey.pem
/etc/letsencrypt/live/portfolio-chk.com/fullchain.pem
/etc/letsencrypt/live/portfolio-chk.com/chain.pem

/etc/letsencrypt/archive/dinagold.org/privkey5.pem

ssh -i "aws.pem" ubuntu@ec2-13-50-136-35.eu-north-1.compute.amazonaws.com

curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo npm start 2>&1 >> log &
npm i pm2@5.1.2

--max-old-space-size=4096
 2>&1 >> log

pm2 ls
pm2 show 0
pm2 stop 0
pm2 delete 0

sudo netstat -nlp | grep 443
sudo netstat -nlp | grep 5000

pm2 start app.js --name 'corsBypass' 
NODE_OPTIONS=--max-old-space-size=100; pm2 start app.js --name 'corsBypass'
pm2 start ecosystem.config.js --env production

dir ~/.pm2/logs/*

