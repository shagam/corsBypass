#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 
#  github.com/saasscaleup/nodejs-ssl-server

# https://mr-alien.medium.com/how-to-configure-pm2-the-right-way-11004871b5dc

#/etc/letsencrypt/live/dinagold.org/privkey.pem


sudo certbot certonly --manual -d dinagold.org --preferred-challenges=dns

# sudo certbot -nginx -d dinagold.net

sudo certbot --manual --preferred-challenges dns certonly -d dinagold.net 
#sudo certbot --manual --preferred-challenges dns certonly -d dinagold.org 
#sudo certbot --manual --preferred-challenges dns certonly -d portfolio-chk.com 

# 2024 Mar 4 namecheap/mange/advanced/add a new record

# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.net
# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.org

# @REM #_acme-challenge.dinagold.org

# @REM HTDNSNgIUZ9xRgvR_yu2t0L_IXcJR29VnkubPYq7rNo

/etc/letsencrypt/live/dinagold.net/privkey.pem -> ../../archive/dinagold.net/privkey1.pem
/etc/letsencrypt/archive/dinagold.net/privkey1.pem
sudo chmod +r /etc/letsencrypt/archive/dinagold.net/privkey1.pem

/etc/letsencrypt/archive/dinagold.net/fullchain1.pem

/etc/letsencrypt/live/dinagold.org/cert.pem
/etc/letsencrypt/live/dinagold.org/privkey.pem
/etc/letsencrypt/live/dinagold.org/fullchain.pem
/etc/letsencrypt/live/dinagold.org/chain.pem


ssh -i "aws.pem" ubuntu@ec2-13-50-136-35.eu-north-1.compute.amazonaws.com

curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo npm start 2>&1 >> log &
npm i pm2@5.1.2

--max-old-space-size=4096
 2>&1 >> log

NODE_OPTIONS=--max-old-space-size=100; pm2 start app.js --name 'corsBypass'
pm2 start ecosystem.config.js --env production

pm2 ls
pm2 show 0
pm2 stop 0
pm2 delete 0

sudo netstat -nlp | grep 443
sudo netstat -nlp | grep 5000

npm start 2>&1 >> ~/.pm2/log &
npm start
pm2 start app.js --name 'corsBypass'  

dir ~/.pm2/logs/*
tail  /home/eli/.pm2/logs/corsBypass-out.log

