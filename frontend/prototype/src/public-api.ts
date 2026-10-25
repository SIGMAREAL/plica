export function publicAssetUrl(path: string) {
  const base=import.meta.env.VITE_PLICA_API_BASE_URL||new URL(import.meta.env.BASE_URL,location.href).href;
  return new URL(path,base.endsWith('/')?base:base+'/').href;
}
