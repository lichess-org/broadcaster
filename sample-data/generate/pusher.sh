#!/bin/bash -e

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_bobby" # with study:write permission
BROADCAST_ROUND_ID="q11ds71x"

#### Part A ####
echo "Pushing each game individually..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4'

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "White 2"]
[Black "Black 2"]
[Result "*"]

1. e4'

#### Part B ####
echo "Pushing combined PGN..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4 e5

[White "White 2"]
[Black "Black 2"]
[Result "*"]

1. e4 e5'

#### Part C ####
echo "Pushing each game individually..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4 e5 2. Nf3'

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "White 2"]
[Black "Black 2"]
[Result "*"]

1. e4 e5 2. Nf3'
