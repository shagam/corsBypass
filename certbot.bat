#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 

sudo certbot --manual --preferred-challenges dns certonly -d dinagold.net 
#sudo certbot --manual --preferred-challenges dns certonly -d dinagold.org 
#sudo certbot --manual --preferred-challenges dns certonly -d portfolio-chk.com 

# 2024 Mar 4 namecheap/mange/advanced/add a new record

# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.net
# @REM https://toolbox.googleapps.com/apps/dig/#TXT/_acme-challenge.dinagold.org

# @REM #_acme-challenge.dinagold.org

# @REM HTDNSNgIUZ9xRgvR_yu2t0L_IXcJR29VnkubPYq7rNo
 
