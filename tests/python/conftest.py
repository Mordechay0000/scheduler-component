"""Shared fixtures for the integration tests.

The tests exercise the scheduler modules directly against a stub `hass`
rather than booting Home Assistant, which keeps them fast enough to run on
every push while still using the real dt_util/voluptuous behaviour.
"""
import os
import sys
import zoneinfo
from types import SimpleNamespace

import pytest
import homeassistant.util.dt as dt_util

sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "..", "custom_components")
)

# Israel is the reference timezone for these tests: the halachic anchors this
# feature exists for are defined there, and a fixed zone keeps sunset maths
# reproducible on any machine.
TEST_TIMEZONE = zoneinfo.ZoneInfo("Asia/Jerusalem")


@pytest.fixture(autouse=True)
def local_timezone():
    previous = dt_util.DEFAULT_TIME_ZONE
    dt_util.set_default_time_zone(TEST_TIMEZONE)
    yield TEST_TIMEZONE
    dt_util.set_default_time_zone(previous)


class FakeStates:
    """Minimal stand-in for hass.states."""

    def __init__(self, states=None):
        self._states = dict(states or {})

    def set(self, entity_id, state, attributes=None):
        self._states[entity_id] = SimpleNamespace(
            entity_id=entity_id, state=state, attributes=attributes or {}
        )

    def remove(self, entity_id):
        self._states.pop(entity_id, None)

    def get(self, entity_id):
        return self._states.get(entity_id)


@pytest.fixture
def states():
    return FakeStates()


@pytest.fixture
def hass(states):
    return SimpleNamespace(states=states)
