import json
import os
import requests

release = requests.get('https://api.github.com/repos/lichess-org/broadcaster/releases/latest').json()

signatures = {}
signatures['mac']     = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-macos.app.tar.gz.sig').text
signatures['linux']   = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-linux.AppImage.tar.gz.sig').text
signatures['windows'] = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-windows.msi.zip.sig').text

version_file = os.path.join(os.path.dirname(__file__), '../updater/version.json')

with open(version_file) as f:
    updater = json.load(f)

updater['version'] = release['tag_name']
updater['pub_date'] = release['published_at']

updater['platforms']['darwin-x86_64']['signature']  = signatures['mac']
updater['platforms']['darwin-aarch64']['signature'] = signatures['mac']
updater['platforms']['linux-x86_64']['signature']   = signatures['linux']
updater['platforms']['windows-x86_64']['signature'] = signatures['windows']

with open(version_file, 'w') as f:
    json.dump(updater, f, indent=2)
    f.write('\n')
