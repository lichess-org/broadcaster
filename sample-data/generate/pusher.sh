#!/bin/bash -e

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_bobby" # with study:write permission
BROADCAST_ROUND_ID="ayAPBpLr"

######

# Push 10 games individually
# 1.e4 for all
for i in {1..3}
do
    echo '
    [White "Player A'$i'"]
    [Black "Player B'$i'"]
    [Result "*"]

    1. e4' > output/game-$i.pgn

    echo "### Pushing game $i"

    time curl -X POST \
        -H "Authorization: Bearer $API_TOKEN" \
        -d @output/game-$i.pgn \
        http://localhost:8080/api/broadcast/round/$BROADCAST_ROUND_ID/push
done

# Update each game individually with a 2nd move
# 1...e5 for all
for i in {1..3}
do
    echo '
    [White "Player A'$i'"]
    [Black "Player B'$i'"]
    [Result "*"]

    1. e4 e5' > output/game-$i.pgn

    echo "### Pushing game $i"

    time curl -X POST \
        -H "Authorization: Bearer $API_TOKEN" \
        -d @output/game-$i.pgn \
        http://localhost:8080/api/broadcast/round/$BROADCAST_ROUND_ID/push
done
