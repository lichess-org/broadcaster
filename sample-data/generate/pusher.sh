#!/bin/bash -e

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_admin" # with study:write permission
BROADCAST_ROUND_ID="fyV3UNud"

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

1. d4'

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "White 3"]
[Black "Black 3"]
[Result "*"]

1. Nc3'

#### Part B ####
echo "Pushing combined PGN of 2 games..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4 e5


[White "White 3"]
[Black "Black 3"]
[Result "*"]

1. Nc3 Nf6'

#### Part C ####
echo "Pushing combined PGN of all 3 games..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4 e5 2. h4


[White "White 2"]
[Black "Black 2"]
[Result "*"]

1. d4 d5 2. a4


[White "White 3"]
[Black "Black 3"]
[Result "*"]

1. Nc3 Nf6 2. Nf3'

#### Part D ####
echo "Pushing no moves"

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 4"]
[Black "Black 4"]
[Result "*"]

'

#### Part E ####
echo "Pushing no moves"

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 5"]
[Black "Black 5"]
[Result "*"]

This is not PGN'


#### Part F ####
echo "Pushing no moves"

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "White 6"]
[Black "Black 6"]
[Result "*"]

1. Kh3'
