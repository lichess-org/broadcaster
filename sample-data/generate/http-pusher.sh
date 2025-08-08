#!/bin/bash -e

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_admin"

########

tour=$(http -A bearer -a "$API_TOKEN" \
  "$LICHESS_URL/broadcast/new" \
  "name=Test")
tour_id=$(echo $tour | jq '.tour.id' | tr -d '"')

round=$(http -A bearer -a "$API_TOKEN" \
  "$LICHESS_URL/broadcast/$tour_id/new" \
  "name=Round 1")
round_id=$(echo $round | jq '.round.id' | tr -d '"')
round_url=$(echo $round | jq '.round.url' | tr -d '"')

echo "Round created: $round_id"
echo $round_url
open $round_url

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$round_id/push <<< \
'[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4'

http -A bearer -a $API_TOKEN --body post $LICHESS_URL/api/broadcast/round/$round_id/push <<< \
'[White "White 1"]
[Black "Black 1"]
[Result "*"]

1. e4 e5'

echo "Game pushed"
