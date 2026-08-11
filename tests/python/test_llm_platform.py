"""The tools join the API Home Assistant already serves.

A separate API means a separate MCP address to add and to keep in step. Home
Assistant lets an integration contribute tools to Assist itself, so these tools
turn up on the endpoint the household already uses - and in the voice pipeline
with them.
"""

import pytest

from scheduler.llm import async_get_tools
from scheduler.llm_api import API_PROMPT, TOOLS


def test_the_plan_tools_are_offered_to_assist(hass):
    result = async_get_tools(hass, None, "assist")

    assert result is not None
    assert [tool.name for tool in result.tools] == [tool_class().name for tool_class in TOOLS]


def test_assist_is_told_how_a_plan_works(hass):
    result = async_get_tools(hass, None, "assist")

    assert result.prompt == API_PROMPT
    assert "candle_lighting@22:30" in result.prompt  # the mistake that costs a Shabbat


@pytest.mark.parametrize("api_id", ["scheduler_shabbat", "something_else"])
def test_no_other_api_is_handed_the_tools_twice(hass, api_id):
    """Our own API builds these tools itself; both at once would double them."""
    assert async_get_tools(hass, None, api_id) is None
