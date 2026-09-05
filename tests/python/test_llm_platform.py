"""The tools join the API Home Assistant already serves.

A separate API means a separate MCP address to add and to keep in step. Home
Assistant lets an integration contribute tools to Assist itself, so these tools
turn up on the endpoint the household already uses - and in the voice pipeline
with them.

That hand-over point arrived in Home Assistant 2026.8. On anything older there
is nothing to contribute to, the platform says so by returning nothing, and the
standalone API carries the tools on its own - which is exactly what the tests
below check, on whichever side of that line they happen to run.
"""

import pytest

from scheduler.llm import async_get_tools
from scheduler.llm_api import API_PROMPT, TOOLS

try:  # Home Assistant 2026.8 and later
    from homeassistant.components.llm import LLMTools  # noqa: F401

    HAS_PLATFORM = True
except ImportError:  # pragma: no cover - depends on the version under test
    HAS_PLATFORM = False

needs_platform = pytest.mark.skipif(
    not HAS_PLATFORM, reason="this Home Assistant has no LLM tools platform to join"
)


@needs_platform
def test_the_plan_tools_are_offered_to_assist(hass):
    result = async_get_tools(hass, None, "assist")

    assert result is not None
    assert [tool.name for tool in result.tools] == [tool_class().name for tool_class in TOOLS]


@needs_platform
def test_assist_is_told_how_a_plan_works(hass):
    result = async_get_tools(hass, None, "assist")

    assert result.prompt == API_PROMPT
    assert "candle_lighting@22:30" in result.prompt  # the mistake that costs a Shabbat


@pytest.mark.parametrize("api_id", ["scheduler_shabbat", "something_else"])
def test_no_other_api_is_handed_the_tools_twice(hass, api_id):
    """Our own API builds these tools itself; both at once would double them."""
    assert async_get_tools(hass, None, api_id) is None


@pytest.mark.skipif(HAS_PLATFORM, reason="this Home Assistant does have the platform")
def test_an_older_home_assistant_is_left_to_the_standalone_api(hass):
    """Nothing to join, and nothing broken by trying: the API is still there."""
    assert async_get_tools(hass, None, "assist") is None
