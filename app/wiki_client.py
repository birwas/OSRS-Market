import requests

HEADERS = {
    "User-Agent": "osrs-market-tracker - github.com/birwas"
}

BASE_URL = "https://prices.runescape.wiki/api/v1/osrs"


class WikiClient:

    def get_mapping(self) -> list[dict]:
        response = requests.get(f"{BASE_URL}/mapping", headers=HEADERS)
        response.raise_for_status()
        return response.json()

    def get_latest(self) -> dict:
        response = requests.get(f"{BASE_URL}/latest", headers=HEADERS)
        response.raise_for_status()
        return response.json()["data"]

    def get_volumes(self) -> dict:
        response = requests.get(f"{BASE_URL}/volumes", headers=HEADERS)
        response.raise_for_status()
        return response.json()["data"]