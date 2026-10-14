import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowRight, ArrowSquareOut, CaretLeft, ChatText, DownloadSimple, LockSimple, Phone, X } from '@phosphor-icons/react';
import { analyseMessage, analyseTransfer, examples, initialTransfer, money, officialLinks, verification } from './domain';
import type { Analysis, Identity, Transfer } from './domain';
import FolderGlyph from './components/FolderGlyph';
import TrustScene from './components/TrustScene';
import EvidenceText from './components/EvidenceText';
import RecordSeal from './components/RecordSeal';

type Page = 'check' | 'transfer' | 'help';
type Stage = 'input' | 'result' | 'verify' | 'paused' | 'recorded';
type Policy = 'privacy' | 'terms' | null;
const pageFromHash = (): Page => ['check', 'transfer', 'help'].includes(location.hash.slice(1)) ? location.hash.slice(1) as Page : 'check';
const titles: Record<Page, string> = { check: '先确认，再行动。', transfer: '转账前，多确认一步。', help: '先停止操作，再寻求帮助。' };
const subtitles: Record<Page, string> = {
  check: '涉及转账或个人信息，先核实对方的请求。',
  transfer: '留一点时间确认收款人，让每一次决定都更从容。',
  help: '已经转账或提供信息，也请先冷静。尽快通过官方渠道联系银行。',
};

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="external-link">{children}<ArrowSquareOut size={17} aria-hidden="true" /><span className="sr-only">（新窗口打开）</span></a>;
}

function Progress({ stage }: { stage: Stage }) {
  const active = stage === 'input' ? 0 : stage === 'result' ? 1 : 2;
  return <ol className="progress" aria-label="核验进度">
    {['提供信息', '查看线索', '独立核实'].map((label, index) => <li key={label} className={index === active ? 'current' : index < active ? 'done' : ''} aria-current={index === active ? 'step' : undefined}>
      <span className="step-number">{index + 1}</span><span>{label}</span>
    </li>)}
  </ol>;
}

function SideNote({ page, stage, findings, goHelp }: { page: Page; stage: Stage; findings: number; goHelp: () => void }) {
  return <aside className="side-note" aria-label="核验提醒">
    <TrustScene state={stage} findings={findings} tone={page === 'transfer' ? 'blue' : 'slate'} />
    <h2>熟悉的声音，<br />也值得再确认。</h2>
    <p>AI 可以模仿声音、头像和语气。真正有用的核验，是从你原有的渠道重新联系对方。</p>
    <div className="side-help">
      <p>{page === 'transfer' ? '这笔转账让你感到不安？' : '已经转账或泄露信息？'}</p>
      <button className="text-button" onClick={goHelp}>查看现在可以做什么 <ArrowRight size={17} aria-hidden="true" /></button>
    </div>
  </aside>;
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [stage, setStage] = useState<Stage>('input');
  const [mode, setMode] = useState<'message' | 'call'>('message');
  const [message, setMessage] = useState('');
  const [callText, setCallText] = useState('');
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [identity, setIdentity] = useState<Identity>('unknown');
  const [transfer, setTransfer] = useState<Transfer>({ ...initialTransfer });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [policy, setPolicy] = useState<Policy>(null);
  const [incident, setIncident] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [pausedTransfer, setPausedTransfer] = useState<Transfer | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const onHash = () => { setPage(pageFromHash()); setStage('input'); setError(''); setConfirmed(false); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, stage]);

  useEffect(() => {
    if (policy) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [policy]);

  const navigate = (next: Page) => {
    if (next === page) { setStage('input'); setError(''); }
    else location.hash = next;
  };
  const currentText = mode === 'message' ? message : callText;

  function inspectMessage(event: FormEvent) {
    event.preventDefault();
    if (currentText.trim().length < 8) {
      setError('请再补充一些信息，至少输入 8 个字符，说明对方要求你做什么。');
      textRef.current?.focus();
      return;
    }
    const result = analyseMessage(currentText);
    setAnalysis(result); setIdentity(result.identity); setError(''); setConfirmed(false); setStage('result');
  }

  function inspectTransfer(event: FormEvent) {
    event.preventDefault();
    if (!transfer.name.trim() || !/^\d+(?:\.\d{1,2})?$/.test(transfer.amount) || !Number.isFinite(Number(transfer.amount)) || Number(transfer.amount) <= 0 || Number(transfer.amount) > 99999999) {
      setError('请填写收款人，并输入大于 0、不超过 99,999,999 的模拟金额，最多保留两位小数。'); return;
    }
    setAnalysis(analyseTransfer(transfer)); setIdentity(transfer.purpose); setConfirmed(false); setError(''); setStage('result');
  }

  function pause() {
    if (page === 'transfer') setPausedTransfer({ ...transfer });
    setStage('paused');
  }

  function downloadIncident() {
    const note = ['OCBC Challenge | 事件整理记录', '这是本地导出的草稿，尚未提交给银行或警方。', `导出时间：${new Date().toLocaleString('zh-CN')}`, '', '用户记录', incident.trim() || '未填写补充记录。', '', '核验内容', analysis?.source ?? '未进行内容核验。', '', '发现的线索', analysis?.findings.map((finding) => `${finding.title}：${finding.evidence}`).join('\n') || '没有记录线索。', '', '请尽快从银行官方渠道寻求帮助。不要在报告中填写验证码或密码。'].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', note], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'OCBC-incident-note.txt'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    setDownloaded(true);
  }

  const completed = stage === 'paused' || stage === 'recorded';
  const mainTitle = page === 'help' ? titles.help : stage === 'input' ? titles[page] : stage === 'result' ? '把不确定的地方，看清楚。' : stage === 'verify' ? '通过独立渠道，核实一次。' : stage === 'paused' ? '先暂停，给核实留一点时间。' : '你的核实记录已更新。';
  const mainSubtitle = page === 'help' ? subtitles.help : stage === 'input' ? subtitles[page] : stage === 'result' ? '内容线索只能提示风险，不能确认身份。下一步，重新联系对方。' : stage === 'verify' ? '不要使用这次请求新提供的号码、链接或账户作为核验依据。' : stage === 'paused' ? '不确定的时候，暂时不操作也是一个好的决定。' : '这是你自行确认的记录，不代表系统已验证身份或保证交易安全。';

  return <div className="app">
    <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); const main = document.getElementById('main'); main?.focus(); main?.scrollIntoView({ block: 'start' }); }}>跳到主要内容</a>
    <aside className="app-sidebar" aria-label="应用导航">
    <header className="site-header">
      <div className="header-inner">
        <button className="wordmark" aria-label="OCBC Challenge 首页" onClick={() => navigate('check')}><strong>OCBC</strong><span>CHALLENGE</span></button>
        <span className="product-name">安心核验</span>
      </div>
    </header>
    <div className="nav-wrap">
      <p className="nav-label">安全工具</p>
      <nav className="main-nav" aria-label="主要功能">
        {([['check', '消息核验', 'red'], ['transfer', '转账前确认', 'blue'], ['help', '紧急帮助', 'gold']] as const).map(([key, title, tone]) => <a key={key} href={`#${key}`} onClick={() => { if (key === page) navigate(key); }} aria-current={page === key ? 'page' : undefined}><FolderGlyph tone={tone} /><span>{title}</span><span className="nav-active-mark" aria-hidden="true" /></a>)}
      </nav>
    </div>
    <button className="sidebar-privacy" onClick={() => setPolicy('privacy')}><LockSimple size={19} aria-hidden="true" /><span><strong>内容仅在本机处理</strong><small>查看隐私说明</small></span></button>
    <p className="sidebar-caption">OCBC Challenge<br />独立概念原型</p>
    </aside>
    <div className="content-shell">
    <div className="app-topbar"><div><span>个人安全中心</span><span className="breadcrumb-slash" aria-hidden="true">/</span><strong>{page === 'check' ? '消息核验' : page === 'transfer' ? '转账前确认' : '紧急帮助'}</strong></div><span className="demo-label">概念演示</span></div>
    <main id="main" className="main-container" tabIndex={-1}>
      <div className="page-heading">
        <div><h1 ref={headingRef} tabIndex={-1}>{mainTitle}</h1><p>{mainSubtitle}</p></div>
        {page !== 'help' && stage === 'input' && <div className="heading-art"><TrustScene state={stage} tone={page === 'transfer' ? 'blue' : 'slate'} compact /></div>}
      </div>

      {page !== 'help' && !completed && <Progress stage={stage} />}

      <div className={`workspace ${page === 'help' ? 'help-workspace' : ''}`}>
        <div className="primary-panel" key={`${page}-${stage}`}>
          {page === 'check' && stage === 'input' && <section className="input-section" aria-label="输入需要核验的信息">
            <div className="section-top"><h2>对方让你做什么？</h2></div>
            <div className="segmented" aria-label="信息类型">
              <button aria-pressed={mode === 'message'} onClick={() => { setMode('message'); setError(''); }}><ChatText size={18} aria-hidden="true" />粘贴消息</button>
              <button aria-pressed={mode === 'call'} onClick={() => { setMode('call'); setError(''); }}><Phone size={18} aria-hidden="true" />描述来电</button>
            </div>
            <form onSubmit={inspectMessage} noValidate>
              <label className="field-label" htmlFor="message">{mode === 'message' ? '消息内容' : '来电内容'}</label>
              <p className="field-help" id="message-help">{mode === 'message' ? '请先删去密码、验证码和完整账户号码。' : '写下对方自称是谁、要求你做什么，以及是否催促或要求保密。'}</p>
              <textarea ref={textRef} id="message" maxLength={4000} rows={4} value={currentText} aria-describedby={`message-help message-count${error ? ' input-error' : ''}`} aria-invalid={!!error} placeholder={mode === 'message' ? '例如：“妈，是我。我换了号码，马上转一笔钱给我，先别告诉其他人……”' : '例如：“来电的声音很像我的女儿，她说急需用钱，让我转到一个新的账户……”'} onChange={(event) => { if (mode === 'message') setMessage(event.target.value); else setCallText(event.target.value); setSelectedExample(null); setError(''); }} />
              <div className="textarea-meta"><span>仅在当前浏览器内处理</span><span id="message-count">{currentText.length} / 4,000</span></div>
              {error && <p className="form-error" id="input-error" role="alert">{error}</p>}
              <div className="examples"><span>用示例体验</span><div>{examples.map((example, index) => <button type="button" className={selectedExample === index ? 'selected' : ''} aria-pressed={selectedExample === index} key={example.label} onClick={() => { setMessage(example.text); setMode('message'); setSelectedExample(index); setError(''); }}>{example.label}</button>)}</div></div>
              <button className="button primary full" type="submit">检查这段内容 <ArrowRight size={19} aria-hidden="true" /></button>
              <p className="under-button"><LockSimple size={15} aria-hidden="true" /> 无需登录，不上传消息内容</p>
            </form>
          </section>}

          {page === 'transfer' && stage === 'input' && <section className="input-section">
            <div className="section-top"><h2>确认转账信息</h2><span className="quiet-label">模拟交易</span></div>
            {pausedTransfer && <div className="draft-notice"><span>有一笔暂存的模拟转账：{pausedTransfer.name}</span><button className="text-button" onClick={() => { setTransfer({ ...pausedTransfer }); setPausedTransfer(null); }}>恢复信息</button></div>}
            <form onSubmit={inspectTransfer} noValidate>
              <div className="form-field"><label className="field-label" htmlFor="payee">收款人姓名</label><input id="payee" value={transfer.name} maxLength={60} autoComplete="off" onChange={(event) => { setTransfer({ ...transfer, name: event.target.value }); setError(''); }} /><p className="field-help">使用虚构信息即可，不需要真实账号。</p></div>
              <div className="form-field"><label className="field-label" htmlFor="amount">转账金额</label><div className="amount-input"><span>SGD</span><input id="amount" type="number" inputMode="decimal" min="0.01" max="99999999" step="0.01" value={transfer.amount} onChange={(event) => { setTransfer({ ...transfer, amount: event.target.value }); setError(''); }} /></div></div>
              <div className="form-field"><label className="field-label" htmlFor="purpose">谁提出了这次请求？</label><select id="purpose" value={transfer.purpose} onChange={(event) => setTransfer({ ...transfer, purpose: event.target.value as Identity })}>{Object.entries(verification).map(([key, entry]) => <option key={key} value={key}>{entry.label}</option>)}</select></div>
              <fieldset className="context-fields"><legend>还有这些情况吗？</legend><label className="checkbox-row"><input type="checkbox" checked={transfer.isNew} onChange={(event) => setTransfer({ ...transfer, isNew: event.target.checked })} /><span>这是第一次向此人转账</span></label><label className="checkbox-row"><input type="checkbox" checked={transfer.pressured} onChange={(event) => setTransfer({ ...transfer, pressured: event.target.checked })} /><span>有人催促或指导我操作</span></label></fieldset>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button primary full" type="submit">继续，先确认风险 <ArrowRight size={19} aria-hidden="true" /></button>
              <p className="under-button">演示流程，不会发起真实转账</p>
            </form>
          </section>}

          {page !== 'help' && stage === 'result' && analysis && <section className="result-section">
            <button className="back-button" onClick={() => setStage('input')}><CaretLeft size={16} aria-hidden="true" />修改{page === 'check' ? '内容' : '转账信息'}</button>
            {page === 'transfer' && <div className="transaction-summary"><div><span>向 {transfer.name} 转账</span><strong>{money(transfer.amount)}</strong></div><span className="status-label">尚未转出 · 模拟</span></div>}
            <div className="result-heading"><span className={`result-marker ${analysis.findings.length ? 'attention' : 'neutral'}`} aria-hidden="true">!</span><div><h2>{analysis.findings.length ? `有 ${analysis.findings.length} 处需要进一步核实` : page === 'transfer' ? '暂未识别到额外风险线索' : '暂未识别到明显的风险话术'}</h2><p>{analysis.findings.length ? '先别急着操作。看看这些线索，再联系本人确认。' : '这不代表请求安全。规则可能漏检，也无法确认对方身份。'}</p></div></div>
            {analysis.findings.length > 0 && <ol className="findings">{analysis.findings.map((finding, index) => <li key={finding.id}><span className="finding-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{finding.title}</h3><blockquote><EvidenceText text={finding.evidence} phrase={finding.match} /></blockquote><p>{finding.detail}</p></div></li>)}</ol>}
            <div className="result-note"><strong>下一步，核实身份与请求</strong><p>系统只能提示内容线索。请通过原有联系方式或官方入口重新确认。</p></div>
            <button className="button primary full" onClick={() => { setConfirmed(false); setStage('verify'); }}>开始独立核实 <ArrowRight size={19} aria-hidden="true" /></button>
            <button className="button secondary full" onClick={pause}>{page === 'transfer' ? '先暂存这笔转账' : '暂时不操作'}</button>
            <p className="under-button">本地规则演示，不提供身份认证或安全保证</p>
          </section>}

          {page !== 'help' && stage === 'verify' && <section className="verification-section">
            <button className="back-button" onClick={() => setStage('result')}><CaretLeft size={16} aria-hidden="true" />返回查看线索</button>
            <div className="identity-field"><label htmlFor="identity">对方自称</label><select id="identity" value={identity} onChange={(event) => { setIdentity(event.target.value as Identity); setConfirmed(false); }}>{Object.entries(verification).map(([key, entry]) => <option key={key} value={key}>{entry.label}</option>)}</select></div>
            <h2>{verification[identity].title}</h2><p className="section-description">{verification[identity].description}</p>
            <ol className="verification-steps">{verification[identity].steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
            {identity === 'bank' && <div className="official-entry"><ExternalLink href={officialLinks.security}>前往 OCBC 官方安全中心</ExternalLink><small>ocbc.com · 外部官方网站</small></div>}
            <div className="confirmation-block"><label className="checkbox-row"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>{verification[identity].confirmation}</span></label><p>仅记录你的确认，不由系统判定身份或交易安全。</p></div>
            <button className="button primary full" disabled={!confirmed} onClick={() => { if (confirmed) setStage('recorded'); }}>记录我的核实结果 <ArrowRight size={19} aria-hidden="true" /></button>
            <button className="button secondary full" onClick={pause}>还未确认，先暂停</button>
          </section>}

          {page !== 'help' && completed && <section className="completion-section">
            <div className="completion-symbol"><RecordSeal paused={stage === 'paused'} /></div>
            <h2>{stage === 'paused' ? page === 'transfer' ? '模拟转账已暂存' : '这次请求已暂停处理' : '已记录：你表示完成了独立核实'}</h2>
            <p>{stage === 'paused' ? '等联系上本人、确认具体请求后，再决定下一步。你可以随时返回查看这次核验。' : '如果仍有任何疑问，请继续暂停操作，或通过官方渠道寻求帮助。'}</p>
            {page === 'transfer' && <dl className="receipt"><div><dt>收款人</dt><dd>{transfer.name}</dd></div><div><dt>金额</dt><dd>{money(transfer.amount)}</dd></div><div><dt>资金状态</dt><dd>未发生实际转账</dd></div></dl>}
            <div className="completion-note">{stage === 'paused' ? '记录仅在本次页面打开期间保留，刷新或关闭后清除。' : '演示到此结束，没有执行任何付款或银行操作。'}</div>
            <button className="button primary full" onClick={() => { setConfirmed(false); setStage(stage === 'paused' ? 'verify' : 'input'); }}>{stage === 'paused' ? '继续核实' : '返回开始'}<ArrowRight size={19} aria-hidden="true" /></button>
            <button className="button secondary full" onClick={() => navigate('help')}>需要帮助</button>
          </section>}

          {page === 'help' && <section className="help-section">
            <h2>现在可以做什么</h2>
            <ol className="help-steps">
              <li><span className="help-number">1</span><div><h3>停止继续转账或提供信息</h3><p>结束可疑通话，不再分享屏幕或验证码。不要按对方的指示“再转一笔来解冻”。</p></div></li>
              <li><span className="help-number">2</span><div><h3>从官方渠道联系银行</h3><p>自行打开银行 App 或官网。若涉及 OCBC 新加坡账户，可使用其官方公布的欺诈求助电话。</p><a className="phone-link" href="tel:+6563633333"><Phone size={22} aria-hidden="true" /><span>+65 6363 3333<small>接通后按 8，报告欺诈或了解临时冻结措施</small></span></a><ExternalLink href={officialLinks.support}>在 OCBC 官网核对电话</ExternalLink></div></li>
              <li><span className="help-number">3</span><div><h3>保留记录，整理发生的事情</h3><p>保存聊天、来电时间、收款信息和交易凭证。是否能追回资金，需要银行进一步处理。</p></div></li>
            </ol>
            <div className="incident-form"><label className="field-label" htmlFor="incident">补充事件经过 <span className="optional">选填</span></label><p className="field-help" id="incident-help">只记录必要信息，不要填写密码或验证码。</p><textarea id="incident" maxLength={4000} rows={4} value={incident} aria-describedby="incident-help" onChange={(event) => { setIncident(event.target.value); setDownloaded(false); }} placeholder="例如：今天下午接到一个自称银行工作人员的电话，对方要求我……" /><button className="button secondary full" onClick={downloadIncident}><DownloadSimple size={19} aria-hidden="true" />下载事件记录</button><p className="field-help" role="status">{downloaded ? '已发起下载。记录尚未提交给银行或警方。' : '只下载到你的设备，不自动提交报告。'}</p></div>
          </section>}
        </div>

        {page === 'help' ? <aside className="side-note help-aside"><TrustScene state="verify" tone="gold" /><h2>求助，不需要等到<br />完全确定被骗。</h2><p>发现异常就可以联系银行。把你知道的情况说清楚，让银行帮助判断下一步。</p><div className="source-note"><strong>官方信息来源</strong><p>OCBC Singapore 安全中心<br />核对日期：2026 年 10 月 14 日</p><ExternalLink href={officialLinks.security}>查看官方安全指引</ExternalLink></div><p className="small-note">此演示无法冻结账户、拦截付款或代你报案。请直接联系银行。</p></aside> : <SideNote page={page} stage={stage} findings={analysis?.findings.length ?? 0} goHelp={() => navigate('help')} />}
      </div>

      <div className="local-note"><LockSimple size={16} aria-hidden="true" /><p>你的内容留在当前浏览器。刷新或关闭页面后清除；下载的文件需自行保管。</p></div>
    </main>

    <footer className="site-footer"><div><span>OCBC Challenge</span><p>独立概念原型，非 OCBC 官方服务。</p></div><div className="footer-links"><button onClick={() => setPolicy('privacy')}>隐私说明</button><button onClick={() => setPolicy('terms')}>使用说明</button></div></footer>
    </div>

    <dialog ref={dialogRef} className="policy-dialog" aria-labelledby="policy-title" onCancel={() => setPolicy(null)} onClose={() => setPolicy(null)}>
      <div className="dialog-top"><h2 id="policy-title">{policy === 'privacy' ? '隐私说明' : '使用说明'}</h2><button className="icon-button" aria-label="关闭说明" onClick={() => setPolicy(null)}><X size={22} /></button></div>
      {policy === 'privacy' ? <><p>消息、来电描述和模拟转账信息只在当前页面的内存中处理。本演示不调用远程分析服务，不使用账户登录、统计追踪或浏览器持久存储。</p><p>刷新或关闭页面会清除本次输入。你主动下载的事件记录会保存在设备上，请自行保管或删除。</p><p>官方链接与电话按钮会打开外部网站或设备拨号程序，由相应服务处理。请不要在演示中输入真实密码、验证码或完整账号。</p></> : <><p>这是围绕 PS3 Digital Trust 制作的独立交互原型，不是 OCBC 官方产品，也未接入银行系统。</p><p>内容检查使用本地文字规则，可能漏报或误报。它不识别 AI 生成的音视频，不验证对方身份，也不保证任何请求安全。</p><p>所有转账、暂存与核实状态均为演示。完成核验表示你自行确认过，不代表银行批准了交易。真实事件请联系银行官方渠道。</p></>}
      <button className="button primary full" onClick={() => setPolicy(null)}>我知道了</button>
    </dialog>
  </div>;
}
