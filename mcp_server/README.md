# Shabbat plan MCP server

Lets a model read and write the Shabbat plan in Home Assistant — in the words a
person uses, not the ones the engine stores.

A model says *"the hotplate should run on its own from 11:30 to 13:00"*; this
server turns that into a timeslot on its own track with a higher priority, which
is the mechanism that makes the group leave the hotplate alone until the
exception ends and take it back afterwards. None of that appears in a tool
signature.

## Setup

```bash
pip install -e /config/custom_components/../mcp_server
```

It needs two environment variables:

| Variable | What it is |
|---|---|
| `HA_URL` | e.g. `http://homeassistant.local:8123` |
| `HA_TOKEN` | a long-lived access token: Home Assistant → your profile → Security → Long-lived access tokens |

Register it with your MCP client:

```json
{
  "mcpServers": {
    "shabbat": {
      "command": "scheduler-mcp",
      "env": {
        "HA_URL": "http://homeassistant.local:8123",
        "HA_TOKEN": "eyJ..."
      }
    }
  }
}
```

The Scheduler integration must be installed in Home Assistant, and the
[Jewish Calendar](https://www.home-assistant.io/integrations/jewish_calendar/)
integration must be enabled — that is where the two ends of the band come from.

## Tools

| Tool | For |
|---|---|
| `list_devices` | finding entity ids |
| `explain_time` | checking a time expression before using it |
| `describe_anchors` | what the band's two ends are |
| `get_shabbat_plan` | reading the plan, in the shape `save_shabbat_plan` accepts |
| `save_shabbat_plan` | creating or replacing it, in one write |
| `add_exception` | giving one device its own hours for a while |
| `remove_exception` | putting it back on its group's hours |
| `list_schedules` / `delete_schedule` | everything else the scheduler holds |

## Writing a time

Only four shapes are accepted, and the third is the one that matters:

```
candle_lighting        exactly when Shabbat comes in
havdalah-30m           30 minutes before it goes out   (also 1h, 1h30m, 01:30)
havdalah@06:30         06:30 on the DAY it goes out
13:00                  13:00 every day - rarely right inside a plan
```

The mistake worth knowing about: an ordinary clock time inside the band — *"off
at 22:30 on Friday night"* — has to be written `candle_lighting@22:30`, meaning
22:30 on the day the band opened. Plain `22:30` fires every night of the week.
`explain_time` says which is which, and `save_shabbat_plan` warns when a plan
contains one.

Anchoring to the *day* rather than to a weekday is also what makes a festival
work: `havdalah@06:30` is the morning that Shabbat or Yom Tov ends, whichever
day of the week that turns out to be.

## A worked plan

```json
{
  "name": "Shabbat",
  "groups": [{
    "name": "home",
    "devices": ["light.salon", "light.hallway", "switch.boiler", "switch.plata"],
    "cubes": [
      {"name": "coming in", "from": "candle_lighting",       "to": "candle_lighting@22:30", "state": "on"},
      {"name": "night",     "from": "candle_lighting@22:30", "to": "havdalah@06:30",        "state": "off"},
      {"name": "morning",   "from": "havdalah@06:30",        "to": "havdalah@13:00",        "state": "on"},
      {"name": "afternoon", "from": "havdalah@13:00",        "to": "havdalah-30m",          "state": "off"},
      {"name": "going out", "from": "havdalah-30m",          "to": "havdalah+1h",           "state": "on"}
    ]
  }],
  "exceptions": [
    {"device": "switch.plata", "name": "hotplate",
     "from": "havdalah@11:30", "to": "havdalah@13:00", "state": "on"}
  ]
}
```

A device named in an exception must also be in a group — an exception is a
device leaving its group for a while, so there has to be a group to leave. Add
`"only_on": "2026-08-15"` to make an exception happen once instead of weekly.

Whatever this server writes opens in the card's plan editor, and whatever is
drawn there reads back out here.

## Tests

```bash
cd mcp_server && python -m pytest tests -q
```

The plan-mapping tests need nothing installed; the tool tests skip themselves
without the MCP SDK.
