#!/bin/bash
#  renew certbot key
#  add txt record _acme-challenge in namecheap 

sudo certbot --manual --preferred-challenges dns certonly -d dinagold.org 


#_acme-challenge.dinagold.org.


 
