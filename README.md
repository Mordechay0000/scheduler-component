# Scheduler
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

Time-based scheduling for Home Assistant — the integration and the Lovelace card in a single installation.

## Introduction

Scheduler lets you control your existing devices based on time. A scheduler entity defines an action at a certain time, for example 'turn on my lamp at 21:00 every day'. Any entity in HA can be used, together with any service that is available in HA.

This repository contains both halves of the project:

* the **integration** (`custom_components/scheduler`), which stores the schedules, creates the `switch.schedule_*` entities and executes the actions;
* the **scheduler card**, a Lovelace card for creating and editing schedules.

The card is bundled inside the integration and is registered with the frontend automatically — there is no separate download and no Lovelace resource to add.

See it in action:

![demonstration video](https://github.com/nielsfaber/scheduler-card/blob/main/screenshots/Demonstration.gif?raw=true)

## Installation

### Step 1: Download files

#### Option 1: Via HACS

Make sure you have [HACS](https://hacs.xyz/) installed. If you don't, run `wget -O - https://get.hacs.xyz | bash -` in HA.
In HACS, add this repository as a custom repository with category **Integration**, then search for "Scheduler" and click download.

#### Option 2: Manual

Download the [latest release](../../releases/latest) as a zip file and extract it into the `custom_components` folder in your HA installation, or clone this repository and merge the `custom_components/` folder with its contents into your configuration directory.

### Step 2: Restart HA

In order for the newly added integration to be loaded, HA needs to be restarted.

### Step 3: Add integration to HA (<--- this is a step that a lot of people forget)

In HA, go to Configuration > Integrations. In the bottom right corner, click on the big button with a '+'.

If the component is properly installed, you should be able to find 'Scheduler' in the list. You might need to clear your browser cache for the integration to show up.

Select it, and the scheduler integration is ready for use.

### Step 4: Add the card to a dashboard

Refresh your browser once (the card is served by the integration, so it only becomes available after step 3). Then add the card in the view where you want it to be shown, either through the card picker ("Scheduler Card") or by editing the YAML:

```yaml
type: custom:scheduler-card
```

## Updating

1. Update the files:
   * Using HACS: there should be a notification in the HACS panel when a new version is available. Follow the instructions within HACS to update.
   * Manually: download the [latest release](../../releases/latest) as a zip file and extract it into the `custom_components` folder, overwriting the previous installation.
2. Restart HA to load the changes.
3. Refresh your browser. The card is served with a version-stamped URL, so a normal refresh is enough — no need to bump `?v=` by hand as with a Lovelace resource.

**To see which version is installed:** in HA, go to Configuration -> Integrations. In the Scheduler integration card, click the '1 device' link, then click the 'Scheduler' device. The 'firmware version' shown in the device info is the installed version number. The card reports the same version in the browser console log.

## Migrating from a separate scheduler-card installation

If you previously installed the card on its own (HACS "Frontend"/Lovelace, or manually into `www/`), remove it — otherwise the browser loads the card twice and the old copy may win.

1. In HACS, go to Frontend, find **scheduler-card** and uninstall it. If you installed manually, delete `www/scheduler-card/`.
2. In HA, go to Settings > Dashboards > Resources (three-dot menu) and delete the entry pointing at `/hacsfiles/scheduler-card/scheduler-card.js` or `/local/scheduler-card/scheduler-card.js`.
3. Restart HA and do a hard refresh of the browser (CTRL + F5, or ⌘ + ⇧ + R).

Your schedules are unaffected — they live in the integration's storage, not in the card.

## Uninstalling

1. Remove scheduler from HA: in HA go to Configuration -> Integrations. Find the card for the scheduler integration, click the button with the 3 dots, and click 'Delete'.
2. Remove the files:
   * When installed with HACS: in the HACS panel go to integrations and look for Scheduler. Click the button with the 3 dots and click 'Uninstall'.
   * When installed manually: in the `custom_components` directory, remove the `scheduler` folder.
3. Restart HA to make all traces of the component disappear.

## Backup

The configuration of your schedules is stored in the `.storage` folder in the HA configuration directory, in a file called `scheduler.storage`.

If you create a snapshot through HA supervisor, this file should automatically be backed up. Else, make sure to include this file in your backup.

The entities in HA are created from the `scheduler.storage` file upon (re)starting HA.

## Shabbat plans

A plan is one schedule that covers a whole Shabbat or Yom Tov: a band from
candle lighting to havdalah, cut into named stretches, with a row per group of
devices. Open it from the candle icon in the card header.

It rests on three things the engine can do that a plain schedule does not need:

* **Times anchored to an entity.** A halachic time is not a fixed offset from
  astronomical sunset, so it has to be read from an entity every time rather
  than baked into the schedule. `sensor.jewish_calendar_upcoming_candle_lighting-00:18:00`
  means "eighteen minutes before whatever that sensor says", re-read at trigger
  time. Enable the [Jewish Calendar](https://www.home-assistant.io/integrations/jewish_calendar/)
  integration to get those sensors.
* **A clock time on the day an anchor names.** `…upcoming_havdalah@06:30:00` is
  half past six on the morning the band ends, whichever day that is. This is
  what keeps the stretches inside the band on a festival, where no weekday rule
  can describe the days at all.
* **Independent tracks.** Timeslots carry a `track`; slots on different tracks
  keep their own partition of the day and may overlap. So a group of devices
  keeps its stretches while one device runs its own hours, and moving a boundary
  drawn for that device leaves everybody else alone. When two tracks act on the
  same entity at once the one with the higher `priority` owns it — which is what
  "detach from the group, then rejoin it" is: while the detach runs, the group
  leaves that device alone, including across a restart; when it ends, the group
  takes the device back.

**Every device in a stretch has its own state and its own settings.** This is
the point of the whole thing: a house on a small generator cannot run the salon
air conditioner and the bedroom ones at once, so during the meal the salon is on
at 16° and the bedrooms are off, and later it is the other way round — one
stretch, one row, not two plans. One light at 50% while another is at 10%, in
the same stretch. A device with nothing set of its own simply follows the
stretch. Reach for an **exception** only when a device needs its own *hours*,
not just its own state.

Lights can also be given a **brightness** and a **colour temperature** (warm
through daylight), per stretch or per override; the stretch is then drawn in the
colour the bulb will actually show, the same way the ordinary time bar tints a
slot.

**Holding a state** (experimental) is `enforce` on a stretch: if a wall switch or
another integration moves a device while that stretch is running, the engine puts
it back — for the switch pressed by accident on Shabbat. It waits 30 seconds
between attempts, so it cannot end up trading service calls with whatever moved
the device, and it only acts on what it can actually compare.

All of these are ordinary schedule features, usable from `scheduler.add` and
`scheduler.edit` without the plan editor.

**A note on the anchors.** Home Assistant's Jewish Calendar has two pairs of
sensors and only one is right here. `upcoming_candle_lighting` and
`upcoming_havdalah` are built on *upcoming Shabbat **or Yom Tov***, so a plan
using them opens on a festival that starts on a Thursday and closes at the end of
a three-day run. The `upcoming_shabbat_*` pair is Shabbat-only and misses every
festival; the plan warns if it finds them.

**Not sure where to start?** The editor offers a guided path in plain language:
pick the devices, say what happens when Shabbat comes in, then build the day out
of named moments — Friday night dinner, bedtime, morning, lunch, a nap, or
anything else you add — each saying what happens from then until the next. It
reads the whole day back before building anything. It is an alternative way in,
never a replacement: everything it produces is editable afterwards, and the
editor is there from the first screen.

### Driving it from a model

The tools are added to the tools Home Assistant already serves, so there is no
separate server to run and no second address to add: whatever MCP endpoint or
voice pipeline the household already uses gets them, alongside `HassTurnOn` and
the rest. Nothing to configure.

They are also registered as an LLM API of their own, called **Shabbat plans**,
for anyone who wants these tools without the rest of Assist: pick it as the API
in a conversation agent's options, or point an MCP client at
`/api/mcp/scheduler_shabbat`.

Either way the tools speak the plan's vocabulary — groups, stretches,
exceptions — so a model never has to know a track from a priority. Times are
written the way a person says them:

```
candle_lighting        exactly when Shabbat comes in
havdalah-30m           30 minutes before it goes out  (also 1h, 1h30m)
havdalah@06:30         06:30 on the DAY it goes out
13:00                  13:00 every day — rarely right inside a plan
```

That last distinction is the one that matters and the one models get wrong, so
`scheduler_explain_time` exists to check an expression before it is used, and
saving a plan that contains a bare clock time returns a warning saying what to
write instead.

| Tool | For |
|---|---|
| `scheduler_list_devices` | finding entity ids |
| `scheduler_explain_time` | checking a time expression |
| `scheduler_describe_anchors` | what the band's two ends are, and whether they are publishing |
| `scheduler_get_plan` | reading the plan, in the shape `save_plan` accepts |
| `scheduler_save_plan` | creating or replacing it, in one write |
| `scheduler_add_exception` / `scheduler_remove_exception` | one device at a time |
| `scheduler_list_schedules` / `scheduler_delete_schedule` | everything else |

## Documentation

* [Card usage & configuration](docs/card.md) — creating schedules and time schemes, card options, `customize`, display options, tags, translations, tips & tricks, troubleshooting.
* [Integration reference](docs/integration.md) — scheduler entities and their states, services, and the schedule data format.

## Development

The card is written in TypeScript under `src/` and bundled with rollup into `custom_components/scheduler/frontend/scheduler-card.js`, which is committed so that HACS and manual installs get a ready-to-serve file.

```bash
npm install
npm run rollup   # build the bundle
npm test         # run the card test suite
```

## Say thank you

If you want to make a donation as appreciation of the work on this project, you can do so via PayPal (preferred) or buy a coffee. Thank you!

<a href="https://www.paypal.com/donate/?business=CLL4T6Y8ACXNN&no_recurring=0&item_name=Thank+you+for+supporting+my+work+on+the+Scheduler+project%2E+it+is+much+appreciated%21&currency_code=EUR" target="_blank"><img src="https://pics.paypal.com/00/s/YzlhMzI2ZjYtZDQxMi00NzNiLThmZTktOTk3MmEyYTA2Zjc0/file.PNG" width="150" /></a>
<a href="https://www.buymeacoffee.com/vrdx7mi" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"></a>

---

## תקציר בעברית <!-- omit in TOC -->

תזמון מבוסס-זמן ל-Home Assistant. הריפו הזה מכיל גם את הרכיב (האינטגרציה שמנהלת ומריצה את התזמונים) וגם את כרטיס ה-Lovelace — בהתקנה אחת. הכרטיס מוגש על ידי האינטגרציה ונרשם אוטומטית, כך שאין צורך להתקין אותו בנפרד ואין צורך להוסיף Lovelace resource.

אם הכרטיס כבר מותקן אצלכם בנפרד (דרך HACS Frontend או ידנית ב-`www/`), יש להסיר אותו ואת ה-resource — אחרת הדפדפן טוען את הכרטיס פעמיים. ראו את הסעיף "Migrating from a separate scheduler-card installation" למעלה. התזמונים עצמם לא מושפעים.

**תוכנית שבת:**

תוכנית אחת מכסה שבת או יום טוב שלם: פס אחד מהדלקת נרות ועד צאת שבת, מחולק לקוביות עם שמות, ומסלול לכל קבוצת מכשירים. נפתחת מסמל הנר בכותרת הכרטיס.

* **עוגן מבוסס-ישות** – זמן הלכתי אינו היסט קבוע מהשקיעה האסטרונומית, ולכן הוא נקרא מהישות מחדש בכל הפעלה. למשל `sensor.jewish_calendar_upcoming_candle_lighting-00:18:00`. נדרשת אינטגרציית [Jewish Calendar](https://www.home-assistant.io/integrations/jewish_calendar/).
* **שעה קבועה ביום של עוגן** – `‎…upcoming_havdalah@06:30:00` היא 06:30 בבוקר שבו הפס נגמר, יהיה זה איזה יום שיהיה. כך הגבולות הפנימיים נשארים בתוך הפס גם ביום טוב, שאף כלל ימים בשבוע לא יכול לתאר.
* **מסלולים עצמאיים** – לכל קבוצה מחיצת זמנים משלה, ולכן גבול שנועד למכשיר אחד אינו מפצל את השאר. מכשיר שמתנתק מקבל מסלול בעדיפות גבוהה יותר: כל עוד הניתוק פועל הקבוצה לא נוגעת בו (גם אחרי הפעלה מחדש), וכשהוא נגמר הקבוצה מחזירה אותו אליה.
* **חריגים בתוך קובייה** – בתוך אותה קובייה אפשר לתת למכשיר בודד מצב שונה בלי לשכפל את קו הזמן: התאורה של הקבוצה דלוקה והפלטה כבויה, באותו קטע בדיוק. המכשיר נשאר בקבוצה וממשיך לעקוב אחריה בכל שאר הקוביות. ״ניתוק״ שמור למקרה שהמכשיר צריך *שעות* משלו, לא רק מצב.
* **בהירות וגוון** – לתאורה אפשר לקבוע אחוז בהירות וטמפרטורת צבע (מחמים ועד אור יום), לקובייה שלמה או למכשיר בודד בתוכה. הקובייה נצבעת בצבע שהנורה תראה בפועל.
* **שמירה על המצב (ניסיוני)** – אם מפסק בקיר או אינטגרציה אחרת משנים מכשיר במהלך הקובייה, המנוע מחזיר אותו למצב שהוגדר. ממתין 30 שניות בין ניסיונות כדי לא להיכנס להתגוששות, ופועל רק על מה שהוא באמת יכול להשוות.
* **העוגנים מכסים גם חג** – `upcoming_candle_lighting` ו-`upcoming_havdalah` בנויים על ״שבת **או יום טוב** הקרובים״, ולכן הפס נפתח גם בחג שנופל ביום חמישי ונסגר בסוף רצף של שלושה ימים. הזוג `upcoming_shabbat_*` הוא לשבת בלבד ומפספס כל חג — התוכנית מזהירה אם הוא בשימוש.
* **אשף מודרך** – בוחרים מכשירים, קובעים מה קורה בכניסת שבת, ואז בונים את היום מזמנים עם שמות: סעודת ליל שבת, שינה, בוקר, סעודת שבת, שנת צהריים — או כל זמן אחר שמוסיפים. כל זמן קובע מה קורה ממנו ועד הבא אחריו, ובסוף האשף מקריא את היום כולו לבדיקה לפני שהוא בונה משהו. האשף הוא דרך כניסה נוספת ולא תחליף: כל מה שהוא בונה ניתן לעריכה אחר כך, והעורך זמין מהמסך הראשון.
* **תמיכה במודלי שפה** – הכלים מצטרפים לכלים ש-Home Assistant כבר מגיש, ולכן אין שרת נפרד להריץ ואין כתובת שנייה להוסיף: כל לקוח MCP או צינור קולי שכבר מחובר לבית מקבל אותם לצד `HassTurnOn` ושאר הכלים, בלי שום הגדרה. במקביל הם רשומים גם כ-LLM API נפרד בשם ״Shabbat plans״, למי שרוצה רק אותם — לבחירה בהגדרות סוכן שיחה או בכתובת `/api/mcp/scheduler_shabbat`. הכלים מדברים באוצר המילים של התוכנית — קבוצות, קוביות וחריגים — כך שמודל לא צריך לדעת דבר על מסלולים ועדיפויות, והזמנים נכתבים כמו שמדברים: `havdalah@06:30`.

**עורך התזמון (Time scheme) המשופר:**

* **צבע לפי פעולה** – ירוק = הדלקה, אדום = כיבוי, אפור עם מסגרת סגולה דקה = משבצת ללא פעולה.
* **צבע לפי בהירות וטמפרטורת צבע** – עבור תאורה, שקיפות המשבצת עוקבת אחרי הבהירות והגוון עוקב אחרי טמפרטורת הצבע (כתום-חם ~2200K ועד לבן-קר ~6500K). מתעדכן חי תוך כדי הזזת הסליידר. למשבצת צבועה יש מסגרת ירוקה דקה כדי שתמיד יהיה ברור שהיא מוגדרת.
* **תוויות שעה** מעל הבר בתחילת/סוף כל משבצת, צבועות בצבע המשבצת, עם עריכה למספר שורות כשהן צפופות.
* **זום ופאן** חלקים (כמו במפה) – כפתורי +/‎−, גלגלת עם Ctrl/⌘, וצביטה במגע. גרירת סרגל השעות (עכבר) או אצבע אחת (מגע) מזיזה את התצוגה. בזום אפשר לגרור ברזולוציית דקות.
* **יצירת משבצת בגרירה** – גוררים על הבר ונוצרת משבצת חדשה (במגע: הקשה כפולה + גרירה). ברירת המחדל היא הפעולה ההפוכה מהמשבצת השכנה, וניתן לשינוי. מחיקה עם מקש Delete.
* **בחירת פעולה** – קודם בוחרים ישות ואז פעולה; לישויות הדלקה/כיבוי יש מתג הפעלה/כיבוי ישירות על הכרטיס (בלי דיאלוג).
* **תמיכה מלאה ב-RTL**.

שאר התיעוד (התקנה, קונפיגורציה, `customize`, תנאים, תגיות, תרגומים) מופיע באנגלית למעלה ובתיקיית [docs](docs).
