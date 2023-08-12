#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 

sudo certbot --manual --preferred-challenges dns certonly -d dinagold.org --preferred-challenges dns


#_acme-challenge.dinagold.org.


 
