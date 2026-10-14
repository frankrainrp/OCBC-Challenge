export type Identity = 'family' | 'bank' | 'work' | 'unknown';
export type Finding = { id: string; title: string; detail: string; evidence: string; match?: string };
export type Analysis = { identity: Identity; findings: Finding[]; source: string };
export type Transfer = {
  name: string;
  amount: string;
  purpose: Identity;
  isNew: boolean;
  pressured: boolean;
};

export const examples = [
  {
    label: '亲友紧急求助',
    text: '妈，是我。我手机坏了，先用这个新号码联系你。我现在有急事，你马上转 3,000 新币到这个新账户。先别告诉其他人，也不要打电话，等我处理完再解释。',
  },
  {
    label: '冒充银行来电',
    text: '您好，我是银行安全部门的工作人员。您的账户存在异常，需要立即处理。请把短信验证码发给我，再将余额转到指定的安全账户。',
  },
  {
    label: '日常消息',
    text: '我们周六下午三点在图书馆门口见。到了以后给我发个消息，不着急，路上慢慢来。',
  },
];

const rules: { id: string; title: string; detail: string; pattern: RegExp }[] = [
  {
    id: 'urgency', title: '催促你立即行动',
    detail: '紧迫感容易让人跳过核实。给自己一点时间，不按对方的节奏操作。',
    pattern: /马上|立即|立刻|紧急|尽快|赶紧|现在就|急事|\burgent\b|right now|immediately/i,
  },
  {
    id: 'secrecy', title: '阻止你向其他人核实',
    detail: '要求保密或不要回拨，会切断独立确认的机会。',
    pattern: /(?:先)?(?:别|不要)(?:告诉|联系|打电话|回拨|跟别人说)|保密|don't (?:tell|call)|keep (?:this |it )?secret/i,
  },
  {
    id: 'credentials', title: '索取验证码或密码',
    detail: '不要向来电者或消息发送者提供验证码、PIN 或登录密码。',
    pattern: /(?:请|把|提供|发送|告诉我|输入|发给我).{0,16}(?:验证码|密码|PIN|OTP)|(?:验证码|密码|PIN|OTP).{0,8}(?:发给我|告诉我|给我)|(?:send|share|give|enter).{0,20}(?:otp|password|verification code)/i,
  },
  {
    id: 'remote', title: '要求安装软件或共享屏幕',
    detail: '这可能暴露你的设备与账户信息。先停止操作，通过独立渠道核实。',
    pattern: /远程控制|屏幕共享|共享屏幕|安装.{0,14}(?:软件|APP|APK)|screen shar|remote access/i,
  },
  {
    id: 'new-channel', title: '更换了联系方式或收款账户',
    detail: '新号码和新账户都需要单独确认，熟悉的声音不能替代身份核实。',
    pattern: /新号码|新账户|新账号|换了号码|手机坏了|new (?:number|account)/i,
  },
  {
    id: 'safe-account', title: '要求转入所谓的安全账户',
    detail: '先结束对话，从你已安装的银行 App 或官方网站寻求帮助。',
    pattern: /安全账户|安全账号|safe account|secure account/i,
  },
  {
    id: 'link', title: '包含需要独立确认的链接',
    detail: '这里不会打开或验证消息里的链接。请自行打开原有 App 或官方网站。',
    pattern: /https?:\/\/[^\s，。]+|www\.[^\s，。]+/i,
  },
];

export function analyseMessage(text: string): Analysis {
  const source = text.trim();
  const identity: Identity = /银行|安全部门|客服|bank|ocbc/i.test(source) ? 'bank'
    : /老板|经理|财务|同事|boss|manager/i.test(source) ? 'work'
      : /妈|爸|女儿|儿子|亲友|家人|朋友|mum|mom|dad|daughter|son/i.test(source) ? 'family' : 'unknown';
  const findings = rules.flatMap((rule) => {
    const sentences = source.split(/(?<=[。！？.!?\n])/u);
    const sentence = sentences.find((part) => {
      if (!rule.pattern.test(part)) return false;
      if (rule.id === 'credentials' && /不要|切勿|绝不|never|do not|don't/i.test(part)) return false;
      return true;
    });
    return sentence ? [{ id: rule.id, title: rule.title, detail: rule.detail, evidence: sentence.trim().slice(0, 140), match: sentence.match(rule.pattern)?.[0] }] : [];
  });
  return { identity, findings, source };
}

export function analyseTransfer(transfer: Transfer): Analysis {
  const findings: Finding[] = [];
  if (transfer.isNew) findings.push({ id: 'new-payee', title: '第一次向此人转账', detail: '请通过原有联系方式确认收款人的姓名、账户和转账原因。', evidence: `新收款人：${transfer.name}` });
  if (transfer.pressured) findings.push({ id: 'pressure', title: '有人正在催促或指导操作', detail: '先结束当前通话或聊天，再独立联系对方。', evidence: '你选择了“有人催促或指导我操作”。' });
  if (transfer.purpose === 'bank') findings.push({ id: 'bank-request', title: '对方以银行工作人员的身份要求转账', detail: '不要按来电者的指示转移资金。请从银行官方渠道核实。', evidence: '对方自称：银行或机构工作人员' });
  return { identity: transfer.purpose, findings, source: `模拟转账：${transfer.name}，SGD ${transfer.amount}` };
}

export const verification: Record<Identity, { label: string; title: string; description: string; steps: string[]; confirmation: string }> = {
  family: {
    label: '亲友', title: '用原有联系方式，重新联系本人',
    description: '即使声音很熟悉，也请通过你原先保存的号码确认。',
    steps: ['结束当前来电或聊天，不使用这次请求提供的新号码。', '打开自己的通讯录，联系你原先保存的本人号码。', '直接确认是否提出这次请求，以及收款人和金额。联系不上时，可再联系另一位熟人。'],
    confirmation: '我已通过原有联系方式联系本人，并确认了这次请求',
  },
  bank: {
    label: '银行或机构', title: '从银行官方渠道，重新发起联系',
    description: '不要通过来电者提供的号码或链接验证来电者自己。',
    steps: ['结束当前通话，不提供验证码，也不转移资金。', '自行打开已安装的银行 App，或手动输入官方网站地址。', '从官方入口联系银行，核实是否存在这次请求。'],
    confirmation: '我已通过银行官方渠道核实了这次请求',
  },
  work: {
    label: '工作联系人', title: '通过既有工作渠道，确认付款请求',
    description: '头像、视频和语气相似，都不能替代原有审批。',
    steps: ['暂停当前对话，不使用新提供的联络方式。', '通过公司通讯录或既有工作渠道联系本人。', '核实收款人、用途和金额，并完成原有付款审批。'],
    confirmation: '我已通过公司既有渠道确认，并完成必要审批',
  },
  unknown: {
    label: '其他或不确定', title: '先找到独立、可信的核验渠道',
    description: '仅凭这段内容，还不能确认对方的身份。',
    steps: ['暂停转账和信息提供，不打开对方发送的新链接。', '从你原先使用的 App、官网或联系人记录找到联系方式。', '独立核实这次请求的身份、目的和收款信息；仍不确定时，先暂停。'],
    confirmation: '我已通过独立渠道核实对方身份和请求内容',
  },
};

export const initialTransfer: Transfer = { name: 'Alex Tan', amount: '3000', purpose: 'family', isNew: true, pressured: true };
export const money = (amount: string) => new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', currencyDisplay: 'code' }).format(Number(amount) || 0);

export const officialLinks = {
  security: 'https://www.ocbc.com/personal-banking/security/overview.page',
  support: 'https://www.ocbc.com/personal-banking/security/secure-banking-ways/loan-scams.page',
};
