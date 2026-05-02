# Branching Example

A Bride of Frankensystem example project that demonstrates branching: hiding
or showing individual questions on a page based on what the participant has
answered, routing groups of pages based on a prior questionnaire, and gating
a single optional page with a flat page-level predicate.

## Run it

From this directory:

```
BOFS branching.toml -d
```

then visit http://localhost:5006/.

## What it covers

| Pattern | Where |
|---|---|
| Question-level `show_if` — hide a question on the same page until a prior answer warrants it | `questionnaires/screening.json` |
| Nested `show_if` — a question that only appears when a *conditionally shown* question takes a particular value | `questionnaires/non_users.json`, `questionnaires/past_use.json`, `questionnaires/active_users.json` |
| `conditional_routing` with `show_if` on arms — route participants through different sets of pages based on a prior answer | `branching.toml`, `PAGE_LIST` |
| Multi-page arm — an arm in a `conditional_routing` block that spans more than one page | `branching.toml`, `PAGE_LIST`; `questionnaires/non_users.json`, `questionnaires/past_use.json` |
| Flat page-level `show_if` — a single optional page shown based on a screening answer, independent of the routing block | `branching.toml`, `PAGE_LIST`; `questionnaires/work_devices.json` |

## How the branching is wired up

### Question-level `show_if`

The screening questionnaire asks for the participant's primary internet device.
If they select *Other*, a free-text field appears immediately — no page reload:

```json
{
    "id": "primary_device_other",
    "questiontype": "field",
    "instructions": "Please specify the device.",
    "show_if": "primary_device == 'Other'"
}
```

The browser-side engine watches `primary_device` and re-evaluates the predicate
on every change. When `show_if` is false the question is hidden, its `required`
attribute is suppressed so it does not block submission, and the posted value
falls back to the column default.

The same pattern appears inside each branch questionnaire — for example,
`primary_platform_other` in `active_users.json` and `stopped_reason_other`
in `past_use.json`.

### `conditional_routing` with `show_if` on arms

The main split lives in `PAGE_LIST` as a `conditional_routing` block. Each arm
has a `show_if` evaluated against the participant's stored answers after the
screening questionnaire is submitted:

```toml
{conditional_routing=[
    {show_if="screening.uses_social_media == 'Yes'", page_list=[
        {name='Social Media Use', path='questionnaire/active_users'}
    ]},
    {show_if="screening.uses_social_media == 'No'", page_list=[
        {name='Non-Use', path='questionnaire/non_users'},
        {name='Past Use', path='questionnaire/past_use'}
    ]}
]}
```

BOFS evaluates arms in order and follows the first one that matches. The
non-user arm contains two pages — participants who answered *No* move through
`non_users` and then `past_use` in sequence, while participants who answered
*Yes* see only `active_users`.

### Flat page-level `show_if`

After the routing block, `work_devices` is a single page that appears only
for participants who said they use their devices for work or study:

```toml
{name='Work and Study', path='questionnaire/work_devices', show_if="screening.uses_for_work == 'Yes'"}
```

This is independent of which arm the participant followed. `uses_for_work` is
in `screening.json`, which every participant submits, so there is no risk of
the predicate being unresolvable.

## Reference syntax

- Inside a questionnaire, bare field names refer to other questions on the same page.
- In `PAGE_LIST`, `screening.uses_social_media` qualifies the field with the questionnaire it came from.

See [Expressions: Calculations and Conditional Display](https://bride-of-frankensystem.readthedocs.io/en/latest/advanced/expressions.html)
for the full syntax reference.
