"""Serve the scheduler card from the integration.

The card used to be installed separately and registered by the user as a
Lovelace resource. It now ships inside this component: the bundle is served
from a static path and handed to the frontend, so a working integration is
all that is needed for `custom:scheduler-card` to exist.
"""
import logging
import os

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = "frontend"
CARD_FILENAME = "scheduler-card.js"
CARD_URL = f"/{DOMAIN}-frontend/{CARD_FILENAME}"

# The URL carries the version so that a browser holding the previous bundle
# fetches the new one after an update. This is what a Lovelace resource
# required the user to do by hand with '?v=n'.
CARD_MODULE_URL = f"{CARD_URL}?v={VERSION}"

# Kept outside hass.data[DOMAIN], which async_setup_entry replaces wholesale.
DATA_STATIC_PATH_REGISTERED = f"{DOMAIN}_frontend_static_path"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card bundle and register it as a frontend module."""
    card_path = os.path.join(os.path.dirname(__file__), FRONTEND_DIR, CARD_FILENAME)

    if not await hass.async_add_executor_job(os.path.isfile, card_path):
        _LOGGER.error(
            "Scheduler card bundle is missing at %s. The integration will work, "
            "but the card will not be available. Reinstall the integration.",
            card_path,
        )
        return

    # A static route cannot be removed from a running aiohttp app, so it is
    # registered once per HA run and survives a reload of the config entry.
    if not hass.data.get(DATA_STATIC_PATH_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL, card_path, True)]
        )
        hass.data[DATA_STATIC_PATH_REGISTERED] = True

    add_extra_js_url(hass, CARD_MODULE_URL)
    _LOGGER.debug("Registered scheduler card at %s", CARD_MODULE_URL)


@callback
def async_unregister_frontend(hass: HomeAssistant) -> None:
    """Stop offering the card to the frontend."""
    try:
        remove_extra_js_url(hass, CARD_MODULE_URL)
    except KeyError:
        pass
