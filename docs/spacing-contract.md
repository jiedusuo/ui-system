# Spacing contract

The component library uses semantic spacing roles rather than choosing a new
Tailwind number in every component.

| Role | Default | Used for |
| --- | ---: | --- |
| `field-gap` | 6px | label → control → help/error |
| `control-x/y` | 10px / 8px | boxed inputs, selects and textareas |
| `control-compact-x/y` | 8px / 6px | dense controls |
| `action-x/y` | 16px / 10px | normal buttons and action rows |
| `action-compact-x/y` | 12px / 6px | tiny buttons |
| `panel` / `panel-y` | 16px / 12px | compact cards, notices and table edges |
| `surface-x/y` | 20px / 16px | standard card and modal content |
| `surface-bottom` | 20px | optical bottom inset for standard cards |
| `stack-xs/sm/md/lg` | 4/6/12/16px | spacing between related children |
| `section` | 24px | spacing between independent sections |

The contract governs form controls and reusable surfaces. Geometry that exists
for a physical reason remains local: chart plots, navigation rails, responsive
grid tracks, coarse-pointer hit targets, icon sizes and the public hero.

## Audit notes

- `Input`, `Textarea`, `Select` and `SecretField` share `controlClass` and
  `controlDensity`; none owns a parallel input box.
- `SectionCard`, `FormSection`, `Modal`, `NoticeBox`, `StatusBox`,
  `StatusStrip`, `StatStrip`, `ReceiptPanel`, `DangerZone`, `DataTable` and
  `PageLoading` use the surface/action roles above.
- `NoticeBox` status meaning is explicit: `info`, `warning`, and `error`.
  Their default marks come from Lucide (`Info`, `TriangleAlert`, `CircleX`);
  legacy `primary`, `danger`, and `neutral` remain compatible.
- Public-editorial primitives, charts, side navigation, author chips and the
  internal shadcn shell were reviewed but keep their measured geometry because
  their spacing represents layout or touch mechanics rather than a generic
  card inset.

When a new reusable component needs a value outside this table, first decide
whether it is genuinely geometry-specific. If it is not, add or reuse a
semantic role instead of an arbitrary utility.
