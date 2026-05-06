# Embedding Media Example

A Bride of Frankensystem example project that demonstrates every place media
(images, audio, and video) can be embedded in a study, and how to serve those
assets from the project's `static/` folder.

## Run it

From this directory:

```
BOFS embedding_media.toml -d
```

then visit http://localhost:5005/.

## What it covers

| Page | Pattern |
|------|---------|
| **Consent** | An image embedded directly in a custom HTML template (`consent.html`). |
| **Images** | An image inside a questionnaire's top-level `instructions` field, an image inside a `textview` question, an image inside a `radiogrid` question's `instructions` field (for stimulus + Likert response), the `picture_select` question type with images as the options themselves, and the `image_click` question type for capturing click coordinates on an image (single-click and multi-click modes). |
| **Audio** | The `audio` question type in two modes (display-only and force-listen with telemetry), plus a final `textview` example showing that you can also drop a plain `<audio controls>` tag into any HTML field if you don't need telemetry or enforcement. |
| **Videos** | The new `video` question type in three modes: display-only, force-watch with native controls + snap-back seek guard, and force-watch with minimal controls (no scrubber, custom Play/Pause). |

## How the static folder works

Anything you place in `static/` is served at the URL `/static/<filename>`.
Reference assets in JSON, HTML, and templates with that path:

```html
<img src="/static/example_image.jpg">
<audio src="/static/example_audio.ogg" controls></audio>
```

```json
{ "questiontype": "video", "src": "/static/example_video.webm" }
```

## Telemetry from the video and audio questions

When a `video` or `audio` question has an `id`, three columns are written to
its questionnaire table:

- `{id}_started` — epoch seconds when the participant first pressed play
- `{id}_ended` — epoch seconds at the last observed activity
- `{id}_watched` (video) / `{id}_listened` (audio) — accumulated forward play
  time, in seconds

The Videos page sets `id` to `demo_native` and `demo_minimal` for the two
force-watch videos; the Audio page sets `id` to `demo_clip` for the
force-listen audio. After running through the example you can open
`/admin` (password: `example`) and download the `videos` and `audio`
questionnaire CSVs to see those columns populated.

## Sample assets in `static/`

| File | Used by | Source / Attribution |
|------|---------|----------------------|
| `example_image.jpg` | Consent page; Images page (instructions, textview, picture_select option A) | Sample file from [file-examples.com](https://file-examples.com/) |
| `example_image_2.jpg` | Images page (radiogrid stimulus, picture_select option B) | [Hubble Ultra Deep Field (part d)](https://commons.wikimedia.org/wiki/File:Hubble_Ultra_Deep_Field_part_d.jpg) — NASA, ESA, S. Beckwith (STScI) and the HUDF Team. Public Domain (NASA imagery). |
| `example_audio.ogg` | Audio page | Sample file from [file-examples.com](https://file-examples.com/) |
| `example_video.webm` | Videos page (all three video questions) | Sample file from [file-examples.com](https://file-examples.com/) |

These assets are bundled solely for the purpose of demonstrating media
embedding patterns. If you fork this example for your own study, replace
them with your own stimuli (and respect the source licenses for any third-
party files you keep).
