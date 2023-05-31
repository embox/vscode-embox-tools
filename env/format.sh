#!/bin/bash

sed '
	s_[ \t]*$__g
' $1 | sed -z '
	s_\n\n\n*_\n\n_g
'
