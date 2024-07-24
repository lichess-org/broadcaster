#!/bin/bash -e

# usage like: ./curl-pusher.sh akARCJwy 64

LICHESS_URL="http://localhost:8080"
API_TOKEN="lip_admin" # with study:write permission
BROADCAST_ROUND_ID="$1"
NUMBER_OF_GAMES="${2:-2}"
function main() {
  pushSingle "1. e4"
  pushCombined "1. e4 e5"
  pushSingle "1. e4 e5 2. Nf4" # should get us an error
  pushCombined "1. e4 e5 2. Nf3 Nf6"
  pushCombined "1. e4 e5 2. Nf3 Nf6 3. Nxe5"
}

function pushCombined() {
  echo
  echo "Pushing combined PGN... $1"
  PGN=""
  for n in $(seq 1 $NUMBER_OF_GAMES); do
    PGN+="
[Event \"Game $n\"]
[White \"White $n\"]
[Black \"Black $n\"]
[Result \"*\"]

$1
"
  done
  curl -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: text/plain" -d "$PGN" \
  "$LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push"
}
function pushSingle() {
  echo
  echo "Pushing individual PGNs... $1"
  for n in $(seq 1 $NUMBER_OF_GAMES); do

  curl -X POST -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: text/plain" -d "
[Event \"Game $n\"]
[White \"White $n\"]
[Black \"Black $n\"]
[Result \"*\"]

$1" "$LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push"
  done
}

main "$@"
