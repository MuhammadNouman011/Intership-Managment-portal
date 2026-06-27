import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { isStaff } from '@/lib/auth/guard'
import { TemplateEditor } from './TemplateEditor'

const DEFAULT_BODY = `<p>This is to certify that <strong>{{full_name}}</strong>, bearing Registration No. <strong>{{reg_number}}</strong>, is a bona fide student of <strong>{{program_full}} (Semester {{semester}})</strong> at COMSATS University Islamabad, Sahiwal Campus.</p>
<p>As part of the degree requirement, the student is required to complete a mandatory internship during the summer break. We recommend the student for an internship at <strong>{{company}}</strong> for the position of <strong>{{position}}</strong>. Your support in providing this opportunity is highly appreciated.</p>
<p>For verification, scan the seal below or visit our verification portal and enter the reference number {{serial}}.</p>`

export default async function TemplatePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isStaff(user.role)) redirect('/dashboard')

  const supabase = await getServerClient()
  const { data: tpl } = await supabase
    .from('letter_templates')
    .select('id, body_html, signatory_name, signatory_designation, footer_text')
    .eq('is_active', true)
    .maybeSingle()

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-6">
        <p className="eyebrow">Letter template</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">Edit the reference letter</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Use placeholders like <span className="serial">{'{{full_name}}'}</span>,{' '}
          <span className="serial">{'{{company}}'}</span>, <span className="serial">{'{{serial}}'}</span>.
          Changes apply to letters issued from now on.
        </p>
      </header>

      <TemplateEditor
        initial={{
          id: tpl?.id ?? '',
          body_html: tpl?.body_html ?? DEFAULT_BODY,
          signatory_name: tpl?.signatory_name ?? 'Internship Coordinator',
          signatory_designation:
            tpl?.signatory_designation ?? 'Internship Coordinator, Department of Computer Science',
          footer_text:
            tpl?.footer_text ??
            'COMSATS University Islamabad, Sahiwal Campus — Department of Computer Science',
        }}
      />
    </div>
  )
}
