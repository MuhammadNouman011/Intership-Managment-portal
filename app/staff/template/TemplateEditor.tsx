'use client'

import { useActionState, useMemo, useState } from 'react'
import { saveTemplate, type TemplateActionResult } from '@/app/actions/template'
import { renderTemplateBody, SAMPLE_VARS } from '@/lib/letters/template'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Seal } from '@/components/ui/Seal'

interface Initial {
  id: string
  body_html: string
  signatory_name: string
  signatory_designation: string
  footer_text: string
}

const initialState: TemplateActionResult = {}

export function TemplateEditor({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(saveTemplate, initialState)
  const [body, setBody] = useState(initial.body_html)
  const [signatory, setSignatory] = useState(initial.signatory_name)
  const [designation, setDesignation] = useState(initial.signatory_designation)
  const [footer, setFooter] = useState(initial.footer_text)

  const previewParas = useMemo(() => renderTemplateBody(body, SAMPLE_VARS), [body])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
      <form action={action} className="space-y-4">
        {state.ok && (
          <p className="rounded-md border border-[var(--st-approved)]/30 bg-[var(--st-approved)]/10 px-3 py-2 text-sm text-[var(--st-approved)]">
            Template saved.
          </p>
        )}
        {state.error && (
          <p className="rounded-md border border-[var(--st-rejected)]/30 bg-[var(--st-rejected)]/10 px-3 py-2 text-sm text-[var(--st-rejected)]">
            {state.error}
          </p>
        )}
        <input type="hidden" name="id" value={initial.id} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="body_html" className="text-sm font-medium text-ink">Letter body</label>
          <textarea
            id="body_html"
            name="body_html"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-[var(--radius-base)] border border-line bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Input label="Signatory name" name="signatory_name" value={signatory} onChange={(e) => setSignatory(e.target.value)} />
        <Input label="Signatory designation" name="signatory_designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
        <Input label="Footer" name="footer_text" value={footer} onChange={(e) => setFooter(e.target.value)} />

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save template'}</Button>
        </div>
      </form>

      {/* Live preview */}
      <Card className="h-fit">
        <CardHeader eyebrow="Live preview" title="Specimen letter" />
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="serial text-xs text-ink-soft">{SAMPLE_VARS.serial}</p>
            <p className="text-xs text-ink-soft">Sample data</p>
          </div>
          <p className="font-serif text-base font-semibold text-ink">TO WHOM IT MAY CONCERN</p>
          {previewParas.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink-soft">{p}</p>
          ))}
          <div className="flex items-end justify-between pt-2">
            <div className="text-xs text-ink-soft">
              <p className="text-ink">{signatory}</p>
              <p>{designation}</p>
            </div>
            <Seal size={64} state="valid" />
          </div>
          <p className="border-t border-line pt-2 text-[11px] text-ink-soft">{footer}</p>
        </CardBody>
      </Card>
    </div>
  )
}
