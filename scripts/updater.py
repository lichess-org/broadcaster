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

platforms = [
    ("darwin-x86_64", "mac"),
    ("darwin-aarch64", "mac"),
    ("linux-x86_64", "linux"),
    ("windows-x86_64", "windows"),
]

for key, platform in platforms:
    updater["platforms"][key]["signature"] = signatures[platform].text
    url = updater["platforms"][key].get("url")
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Error fetching URL {url} for {key}: {response.status_code}")

with open(version_file, "w") as f:
    json.dump(updater, f, indent=2)
    f.write("\n")
