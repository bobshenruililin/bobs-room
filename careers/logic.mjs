export function ageDays(date, now = new Date()) {
  const t = Date.parse(date + 'T00:00:00Z');
  return Number.isFinite(t) ? Math.max(0, Math.floor((now.getTime() - t) / 86400000)) : Infinity;
}
export function evidenceStatus(job, now = new Date()) {
  return job.status === 'listed' && ageDays(job.checked_on, now) <= 14 ? 'listed' : 'needs_review';
}
export function matches(job, filters, now = new Date()) {
  const terms = (filters.search || '').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const text = [job.title, job.company, job.summary, job.eligibility, job.category, ...(job.locations || [])].join(' ').toLocaleLowerCase();
  if (!terms.every(term => text.includes(term))) return false;
  if (filters.location && !job.locations.includes(filters.location)) return false;
  if (filters.category && job.category !== filters.category) return false;
  if (filters.company && job.company !== filters.company) return false;
  const cohorts = (job.cohort || []).map(String);
  if (filters.cohort === 'unspecified' && (cohorts.length || job.cohort_min || job.cohort_max)) return false;
  if (filters.cohort && filters.cohort !== 'unspecified' && cohorts.length && !cohorts.includes(filters.cohort)) return false;
  if (filters.cohort && filters.cohort !== 'unspecified' && job.cohort_min && Number(filters.cohort) < job.cohort_min) return false;
  if (filters.cohort && filters.cohort !== 'unspecified' && job.cohort_max && Number(filters.cohort) > job.cohort_max) return false;
  if (filters.duration === 'unknown' && job.duration_months != null) return false;
  if (filters.duration && filters.duration !== 'unknown' && (job.duration_months == null || job.duration_months > Number(filters.duration))) return false;
  if (filters.duration && filters.duration !== 'unknown' && job.duration_min_exclusive && job.duration_months === Number(filters.duration)) return false;
  if (filters.status && evidenceStatus(job, now) !== filters.status) return false;
  return true;
}
export function sortJobs(jobs, sort = 'fresh') {
  return [...jobs].sort((a,b) => {
    if (sort === 'company') return a.company.localeCompare(b.company) || a.title.localeCompare(b.title);
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'duration') return (a.duration_months ?? Infinity) - (b.duration_months ?? Infinity) || a.company.localeCompare(b.company);
    const priority = (evidenceStatus(a) === 'listed' ? 0 : 1) - (evidenceStatus(b) === 'listed' ? 0 : 1);
    return priority || (b.checked_on || '').localeCompare(a.checked_on || '') || a.company.localeCompare(b.company);
  });
}
export function safeUrl(value) { try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"','""') + '"';
}
export function exportCsv(jobs) {
  const columns = ['company','title','locations','category','employment','work_mode','duration_text','duration_months','duration_min_exclusive','hours_text','days_per_week','cohort','cohort_min','cohort_preferred','salary_text','eligibility','caveat','source_published_at','source_updated_at','last_fetched_at','checked_on','status','stored_status','verification','evidence_note','source_url'];
  return '\ufeff' + [columns.map(csvCell).join(','),...jobs.map(job=>{const j={...job,stored_status:job.status,status:evidenceStatus(job)};return columns.map(k=>csvCell(Array.isArray(j[k])?j[k].join('; '):j[k])).join(',');})].join('\r\n');
}
