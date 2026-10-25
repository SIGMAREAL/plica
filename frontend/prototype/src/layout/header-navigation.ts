import { knowledgeGroups } from './navigation-sections';

const descriptions: Record<string, string> = {
  home: '发现值得深入的工程设计', library: '阅读有出处的真实系统案例',
  products: '从每天使用的软件出发', companies: '沿着工程团队的公开记录', systems: '围绕同一类系统问题探索',
  graph: '连接产品、机制与概念', glossary: '在真实案例里理解术语',
  research: '阅读方法、实验与证据', compare: '比较约束下的不同选择',
};
const links = (pages: readonly (readonly [string, string])[]) => pages.map(([page, label]) => ({
  page, label, href: '#/' + (page === 'home' ? '' : page), description: descriptions[page],
}));

export const headerDirectLinks = links([
  ...knowledgeGroups[0].pages.filter(([page]) => page === 'library'),
  ...knowledgeGroups[1].pages,
]).map(link => ({ ...link, label: link.label.replace(/^按/, '') }));

export const headerNavigation = [
  { id: 'knowledge', label: '知识', groups: [
    { label: '连接知识', featured: true, links: links(knowledgeGroups[2].pages.slice(0, 2)) },
    { label: '深入阅读', featured: false, links: links(knowledgeGroups[2].pages.slice(2)) },
  ] },
  { id: 'about', label: '关于 Plica', groups: [
    { label: '了解 Plica', featured: true, links: [{ page: 'about', label: '编辑原则', href: '#/about', description: '从一手资料，理解真实系统' }] },
    { label: '参与项目', featured: false, links: [
      { page: 'skill', label: 'Agent Skill', href: '#/skill', description: '把知识带进你的 Agent 工作流' },
      { page: 'sponsor', label: '合作与赞助', href: '#/sponsor', description: '支持独立技术知识项目' },
      { page: 'github', label: 'GitHub', href: 'https://github.com/SIGMAREAL/plica', description: '查看项目与参与贡献' },
    ] },
  ] },
] as const;
