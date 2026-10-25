import { ArrowUpRight } from '@phosphor-icons/react';
import { Badge, LinkButton } from '../ui';
import { EvidenceNote, PageHeader, SectionHeading } from '../ui/content';
import { publicAssetUrl } from '../public-api';

export function InfoPage({ page }: { page: 'about'|'sponsor'|'skill' }) {
  if(page==='skill')return <div className="reading-width"><PageHeader title="Plica Architecture Skill" description="先理解场景与约束，再从一手案例中寻找适用的设计。"/><div className="surface info-panel"><Badge variant="info">开放 Agent Skill</Badge><div className="reading-actions"><LinkButton href={publicAssetUrl('skill/plica-architecture/SKILL.md')} download="SKILL.md">获取 SKILL.md<ArrowUpRight size={15}/></LinkButton><LinkButton href={publicAssetUrl('api/v1/index.json')} variant="secondary" external>机器可读索引<ArrowUpRight size={15}/></LinkButton></div>{[['收集业务上下文','规模、SLO、延迟、一致性、成本和团队资源。'],['检索案例与论文','每项关键观点都能追溯原始出处。'],['提供备选架构','列出适用前提、风险与验证方法。'],['形成执行方案','ADR、渐进发布、回滚、可观测性与测试。']].map(([title,description])=><section key={title}><SectionHeading title={title}/><p>{description}</p></section>)}</div><EvidenceNote>这是公开参考知识 Skill，执行能力依赖你的 Agent 环境，不会自动连接私有仓库。</EvidenceNote></div>;
  const about=page==='about';
  const items=about?[['优先一手资料','官方技术博客、原团队演讲、研究论文和事故复盘。重要事实必须能回到出处。'],['不只讲成功','关注失败、迁移与复杂性如何转移，记录可靠性和成本背后的取舍。'],['事实与推断分开','区分原文陈述、编辑总结和有限推论，不假装知道团队未公开的内部机制。']]:[['广告与编辑分开','合作展示将明确标注，不影响独立收录。'],['不出售排名或观点','赞助不能购买文章排名或编辑结论。'],['优先实际价值','优先考虑对开发者有实际价值的产品。']];
  return <div className="reading-width"><PageHeader title={about?'编辑原则':'合作与赞助'} description={about?'收藏值得长期保存的第一手工程资料，理解软件如何组织自己。':'以明确标注的合作，支持独立技术知识项目的长期维护。'}/><div className="surface info-panel">{items.map(([title,description])=><section key={title}><SectionHeading title={title}/><p>{description}</p></section>)}</div>{!about&&<EvidenceNote>赞助位仍在筹备，当前没有已签约赞助商或可披露的流量数据，商业联系渠道尚未开放。</EvidenceNote>}</div>;
}
