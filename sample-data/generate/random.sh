#!/bin/bash

API_TOKEN=lip_admin
LICHESS_URL=http://localhost:8080
BROADCAST_ROUND_ID=VqUCLY1k

moves() {
    pgn="1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1"
    moves=($pgn)
    echo "${moves[@]:0:$((RANDOM % ${#moves[@]} + 1))}"
}

pgn() {
    for n in $(seq 1 $1); do
        echo "

[White \"White $n\"]
[Black \"Black $n\"]
[Result \"*\"]

$(moves)"
    done
}

send_multiple_games() {
    curl -X POST \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: text/plain" \
        -d "
    $(pgn 64)
    " \
        "$LICHESS_URL/api/broadcast/round/$BROADCAST_ROUND_ID/push"
}

while true; do
    send_multiple_games
    sleep 1
done
