"""The bit that talks to Home Assistant.

Kept separate and small so the plan logic can be tested without a server, and
so the failure messages say what to do about them rather than showing a status
code.
"""
from __future__ import annotations

import os
from typing import Any

import httpx


class HomeAssistantError(RuntimeError):
    """A request that did not work, phrased as something to act on."""


class HomeAssistant:
    def __init__(self, url: str | None = None, token: str | None = None, timeout: float = 20.0):
        self.url = (url or os.environ.get("HA_URL") or "http://homeassistant.local:8123").rstrip("/")
        self.token = token or os.environ.get("HA_TOKEN") or ""
        self.timeout = timeout
        if not self.token:
            raise HomeAssistantError(
                "No Home Assistant token. Set HA_TOKEN to a long-lived access token "
                "(Home Assistant → your profile → Security → Long-lived access tokens) "
                "and HA_URL to the address of the server."
            )

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    async def _request(self, method: str, path: str, json: Any = None) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method, f"{self.url}{path}", headers=self._headers(), json=json
                )
            except httpx.RequestError as err:
                raise HomeAssistantError(
                    f"Could not reach Home Assistant at {self.url} ({err}). Check HA_URL "
                    "and that the server is running."
                ) from err

        if response.status_code == 401:
            raise HomeAssistantError("Home Assistant rejected the token. Check HA_TOKEN.")
        if response.status_code == 404 and path.startswith("/api/scheduler"):
            raise HomeAssistantError(
                "Home Assistant has no scheduler API. Install the Scheduler integration "
                "and add it under Settings → Devices & services."
            )
        if response.status_code >= 400:
            raise HomeAssistantError(
                f"Home Assistant refused the request ({response.status_code}): {response.text}"
            )
        if not response.content:
            return None
        try:
            return response.json()
        except ValueError:
            return response.text

    async def states(self) -> list[dict[str, Any]]:
        return await self._request("GET", "/api/states")

    async def schedules(self) -> list[dict[str, Any]]:
        return await self._request("GET", "/api/scheduler/list")

    async def add_schedule(self, payload: dict[str, Any]) -> Any:
        return await self._request("POST", "/api/scheduler/add", payload)

    async def edit_schedule(self, payload: dict[str, Any]) -> Any:
        return await self._request("POST", "/api/scheduler/edit", payload)

    async def remove_schedule(self, schedule_id: str) -> Any:
        return await self._request("POST", "/api/scheduler/remove", {"schedule_id": schedule_id})
