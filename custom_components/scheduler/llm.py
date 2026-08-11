"""The Shabbat plan tools, offered to Home Assistant's own Assist API.

Registering an API of our own (see llm_api.py) gives the tools a second MCP
address of their own, which means a second server to add and a choice to make
every time. Home Assistant lets an integration hand tools to the API it already
serves instead, so the tools show up wherever Assist does - the MCP endpoint the
household already has, the voice pipeline, any conversation agent - with no
extra address anywhere.

Both remain true at once: the tools are here, and the standalone API is still
registered for anyone who wants only these tools and nothing else.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.llm import LLM_API_ASSIST

from .llm_api import API_PROMPT, TOOLS

_LOGGER = logging.getLogger(__name__)


@callback
def async_get_tools(hass: HomeAssistant, llm_context: Any, api_id: str) -> Any:
    """Hand the plan tools to Assist, and to nothing else.

    Returning None for any other API is what the platform expects: our own API
    builds the same tools itself, and handing them over twice would show every
    tool twice in a merged one.
    """
    try:
        from homeassistant.components.llm import LLMTools
    except ImportError:
        # older Home Assistant: no such platform, and the standalone API carries
        # the tools on its own
        return None

    if api_id != LLM_API_ASSIST:
        return None

    return LLMTools(tools=[tool() for tool in TOOLS], prompt=API_PROMPT)
