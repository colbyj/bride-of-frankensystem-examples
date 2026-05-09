# Branching Example

Shows BOFS's two flavours of conditional display: question-level `show_if`
(hide a question on the same page until a prior answer warrants it) and
page-level `show_if` / `conditional_routing` (route through different
follow-up pages based on a screening answer).

The screening questionnaire (`questionnaires/screening.json`) drives
everything. Look at:

- `primary_device_other` for question-level `show_if` reacting to a
  same-page answer.
- The `conditional_routing` block in `branching.toml`'s `PAGE_LIST` for
  the page-level branch — *Yes* takes one path, *No* takes a two-page
  path.
- `work_devices` in `PAGE_LIST` for a flat page-level `show_if` outside
  the routing block.

Field names are bare inside a questionnaire (refer to other questions on
the same page) and qualified in `PAGE_LIST`
(`screening.uses_social_media`).

See [Expressions: Calculations and Conditional Display](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/expressions.html)
for the full syntax.
