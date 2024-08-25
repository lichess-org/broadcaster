import datetime
import json
import os
import requests

with open('package.json') as f:
    app = json.load(f)

signatures = {}
signatures['mac']     = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-macos.app.tar.gz.sig').text
signatures['linux']   = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-linux.AppImage.tar.gz.sig').text
signatures['windows'] = requests.get('https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-windows.msi.zip.sig').text

current_datetime = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

version_file = os.path.join(os.path.dirname(__file__), '../updater/version.json')

with open(version_file) as f:
    version = json.load(f)

version['version'] = 'v' + app['version']
version['pub_date'] = current_datetime

version['platforms']['darwin-x86_64']['signature']  = signatures['mac']
version['platforms']['darwin-aarch64']['signature'] = signatures['mac']
version['platforms']['linux-x86_64']['signature']   = signatures['linux']
version['platforms']['windows-x86_64']['signature'] = signatures['windows']

with open(version_file, 'w') as f:
    json.dump(version, f, indent=2)
    f.write('\n')
