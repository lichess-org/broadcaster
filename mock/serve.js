import http from 'http'

const server = http.createServer((req, res) => {
    console.log(req.url)

    if (req.url.startsWith('/get-broadcast.json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(
            JSON.stringify({
                tour: {
                    description: 'Only the best of the best',
                    id: 'QYiOYnl1',
                    name: 'Trevlar Invitational',
                    slug: 'trevlar-invitational',
                    url: 'http://localhost:8080/broadcast/trevlar-invitational/phgcXuBl',
                },
                rounds: [
                    {
                        id: 'BueO56UJ',
                        name: 'Finals Day 1',
                        slug: 'finals-day-1',
                        url: 'http://localhost:8080/broadcast/trevlar-invitational/finals-day-1/BueO56UJ',
                    },
                    {
                        id: 'yeGGfkfY',
                        name: 'Finals Day 2',
                        slug: 'finals-day-2',
                        url: 'http://localhost:8080/broadcast/trevlar-invitational/finals-day-2/yeGGfkfY',
                    },
                ],
            })
        )
    } else if (req.url.startsWith('/post-pgn.json')) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(
            JSON.stringify({
                ok: true,
            })
        )
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.write('Not found')
    }

    res.end()
})

console.log('Server is running on http://localhost:3000')
server.listen(3000)
