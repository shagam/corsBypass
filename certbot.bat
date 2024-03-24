#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 


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