#!/bin/bash -e

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_bobby" # with study:write permission
BROADCAST_ROUND_ID="ixuNxFcc"

####################

echo $LICHESS_URL/broadcast/-/-/$BROADCAST_ROUND_ID

# Push games individually
# 1.e4 for all
for i in {1..2}
do
    echo "Pushing game $i, move 1..."
    
    http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "Player '$i'W"]
[Black "Player '$i'B"]
[Result "*"]

1. e4'
done

# Update each game individually with a 2nd move
# 1...e5 for all
for i in {1..2}
do
    echo "Pushing game $i, move 2..."

    http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< \
'[White "Player '$i'W"]
[Black "Player '$i'B"]
[Result "*"]

1. e4 e5'
done

####################

echo "Pushing 3rd move to all games (combined PGN)..."

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push <<< '
[White "Player 1W"]
[Black "Player 1B"]
[Result "*"]

1. e4 e5 2. Nf3

[White "Player 2W"]
[Black "Player 2B"]
[Result "*"]

1. e4 e5 2. Nf3'
