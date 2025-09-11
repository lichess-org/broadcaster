#!/usr/bin/env python3
import json
import os
import requests

release = requests.get("https://api.github.com/repos/lichess-org/broadcaster/releases/latest").json()

signatures = {}
signatures["mac"] = requests.get("https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-macos.app.tar.gz.sig")
signatures["linux"] = requests.get("https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-linux.AppImage.sig")
signatures["windows"] = requests.get("https://github.com/lichess-org/broadcaster/releases/latest/download/Lichess-Broadcaster-windows.msi.zip.sig")

for platform, response in signatures.items():
    if response.status_code != 200:
        raise Exception(f"Error fetching signature for {platform}: {response.status_code}")

version_file = os.path.join(os.path.dirname(__file__), "../updater/version.json")

with open(version_file) as f:
    updater = json.load(f)

updater["version"] = release["tag_name"]
updater["pub_date"] = release["published_at"]

updater["platforms"]["darwin-x86_64"]["signature"] = signatures["mac"].text
updater["platforms"]["darwin-aarch64"]["signature"] = signatures["mac"].text
updater["platforms"]["linux-x86_64"]["signature"] = signatures["linux"].text
updater["platforms"]["windows-x86_64"]["signature"] = signatures["windows"].text

with open(version_file, "w") as f:
    json.dump(updater, f, indent=2)
    f.write("\n")
