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

**עורך התזמון (Time scheme) המשופר:**

* **צבע לפי פעולה** – ירוק = הדלקה, אדום = כיבוי, אפור עם מסגרת סגולה דקה = משבצת ללא פעולה.
* **צבע לפי בהירות וטמפרטורת צבע** – עבור תאורה, שקיפות המשבצת עוקבת אחרי הבהירות והגוון עוקב אחרי טמפרטורת הצבע (כתום-חם ~2200K ועד לבן-קר ~6500K). מתעדכן חי תוך כדי הזזת הסליידר. למשבצת צבועה יש מסגרת ירוקה דקה כדי שתמיד יהיה ברור שהיא מוגדרת.
* **תוויות שעה** מעל הבר בתחילת/סוף כל משבצת, צבועות בצבע המשבצת, עם עריכה למספר שורות כשהן צפופות.
* **זום ופאן** חלקים (כמו במפה) – כפתורי +/‎−, גלגלת עם Ctrl/⌘, וצביטה במגע. גרירת סרגל השעות (עכבר) או אצבע אחת (מגע) מזיזה את התצוגה. בזום אפשר לגרור ברזולוציית דקות.
* **יצירת משבצת בגרירה** – גוררים על הבר ונוצרת משבצת חדשה (במגע: הקשה כפולה + גרירה). ברירת המחדל היא הפעולה ההפוכה מהמשבצת השכנה, וניתן לשינוי. מחיקה עם מקש Delete.
* **בחירת פעולה** – קודם בוחרים ישות ואז פעולה; לישויות הדלקה/כיבוי יש מתג הפעלה/כיבוי ישירות על הכרטיס (בלי דיאלוג).
* **תמיכה מלאה ב-RTL**.

שאר התיעוד (התקנה, קונפיגורציה, `customize`, תנאים, תגיות, תרגומים) מופיע באנגלית למעלה ובתיקיית [docs](docs).
