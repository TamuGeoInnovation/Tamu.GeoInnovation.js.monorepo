export function getXmlStatusCode(xml: string): number {
  const [group, code] = new RegExp(/<QueryStatusCodeValue>(.+?)<\/QueryStatusCodeValue>/).exec(xml);

  return parseInt(code);
}
