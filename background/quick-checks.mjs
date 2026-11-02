// Bounded, non-executing review of added/edited lines. No provider or repository code.
export const categories = ['Syntax', 'Security', 'Reliability', 'Accessibility', 'Test quality'];
const rules = [
  {id:'dynamic-evaluation',category:'Security',ext:/\.[cm]?[jt]sx?$/,pattern:/\b(?:eval\s*\(|new\s+Function\s*\()/,reason:'Dynamic code evaluation: verify that untrusted input cannot reach this call.',next:'Trace the input and test rejection of untrusted expressions.'},
  {id:'html-injection',category:'Security',ext:/\.(?:[cm]?[jt]sx?|html)$/,pattern:/\.innerHTML\s*=|dangerouslySetInnerHTML\s*=/,reason:'Raw HTML insertion: verify sanitization at this boundary.',next:'Test that user-controlled markup is rendered safely, not executed.'},
  {id:'tls-disabled',category:'Security',ext:/\.(?:[cm]?[jt]sx?|json|py)$/,pattern:/rejectUnauthorized\s*:\s*false|verify\s*=\s*False/,reason:'Certificate verification appears disabled.',next:'Verify that invalid certificates are rejected in the production configuration.'},
  {id:'empty-catch',category:'Reliability',ext:/\.[cm]?[jt]sx?$/,pattern:/\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/,reason:'An empty catch may hide an operation failure.',next:'Exercise the failure path and check that callers or users receive the intended signal.'},
  {id:'image-alt',category:'Accessibility',ext:/\.(?:html|jsx|tsx)$/,pattern:/<img\b[^>]*>/gi,reject:/\balt\s*=/i,reason:'Image markup has no explicit alt attribute; verify its accessible name or decorative intent.',next:'Inspect the rendered accessible name; use descriptive alt text or empty alt for decoration.'},
  {id:'disabled-test',category:'Test quality',ext:/\.[cm]?[jt]sx?$/,pattern:/\b(?:it|test|describe)\.(?:skip|only)\s*\(/,reason:'A skipped or exclusive test may leave regressions unchecked.',next:'Run the intended suite without the skip/only modifier and verify relevant cases execute.'},
];

export function reviewChanges(files) {
  const findings=[],examined=new Set();
  for(const file of files) {
    if(file.deleted || !Array.isArray(file.changedLines))continue;
    const eligible=rules.filter(r=>r.ext.test(file.name));
    for(const r of eligible)examined.add(r.category);
    const lines=file.text.split('\n');
    for(const number of file.changedLines) {
      const line=lines[number-1]||'';
      if(/^\s*(?:\/\/|\/\*|\*|<!--|#)/.test(line))continue;
      for(const rule of eligible) {
        rule.pattern.lastIndex=0;
        const match=rule.pattern.exec(line);
        if(!match || (rule.reject && rule.reject.test(match[0])))continue;
        findings.push({id:`${rule.id}:${file.name}:${number}`,rule:rule.id,category:rule.category,
          status:'possible',file:file.name,line:number,reason:rule.reason,next:rule.next,
          evidence:'Pattern on an added/edited line; not an executed behavior test.'});
      }
    }
  }
  return {findings,examined:[...examined]};
}

export function summarizeCategories(checks,review) {
  return categories.map(category=>{
    const syntax=category==='Syntax'?checks.filter(c=>/syntax/i.test(c.kind)):[];
    const tests=category==='Test quality'?checks.filter(c=>c.kind==='User-approved local test'):[];
    const relevant=[...syntax,...tests];
    return {category,possible:review.findings.filter(f=>f.category===category).length,
      failedChecks:relevant.filter(c=>c.status==='failed').length,
      checked:relevant.some(c=>['passed','failed'].includes(c.status))||review.examined.includes(category),
      deferred:relevant.filter(c=>['blocked','deferred'].includes(c.status)).length};
  });
}
