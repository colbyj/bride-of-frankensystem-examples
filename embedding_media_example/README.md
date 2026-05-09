# Embedding Media Example

Every place media (images, audio, video) can sit in a BOFS study, on one
page each:

- **Consent** — image inside a custom HTML template.
- **Images** — image in `instructions`, in a `textview`, in a `radiogrid`
  stimulus; `picture_select` (images as options) and `image_click`
  (capturing click coordinates).
- **Audio** — `audio` question in display-only and force-listen modes,
  plus a plain `<audio controls>` tag for cases where you don't need
  telemetry.
- **Videos** — `video` question in three modes: display-only,
  force-watch with native controls + snap-back seek guard, and
  force-watch with minimal custom controls.

Anything in `static/` is served at `/static/<filename>`, so JSON / HTML /
templates all reference assets the same way.

## Telemetry

When a `video` or `audio` question has an `id`, three columns get written
to its questionnaire table: `{id}_started`, `{id}_ended`, and
`{id}_watched` / `{id}_listened` (accumulated forward play time, in
seconds). The example sets ids on the force-watch / force-listen
questions; download the `videos` and `audio` CSVs from `/admin` to see
those columns populated.

## Sample assets

`example_image.jpg`, `example_audio.ogg`, and `example_video.webm` come
from [file-examples.com](https://file-examples.com/).
`example_image_2.jpg` is [Hubble Ultra Deep Field (part d)](https://commons.wikimedia.org/wiki/File:Hubble_Ultra_Deep_Field_part_d.jpg)
(NASA/ESA, public domain). Replace them with your own stimuli when
forking.
