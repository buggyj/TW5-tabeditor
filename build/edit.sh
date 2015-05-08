#!/bin/bash


node ../../../../tiddlywiki.js \
	./demoedit \
	--verbose \
	--server 8091 $:/core/save/all \
	|| exit 1


