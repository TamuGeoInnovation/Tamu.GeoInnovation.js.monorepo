export function getXmlStatusCode(xml: string): number {
  const [code] = new RegExp(/<QueryStatusCodeValue>(.+?)<\/QueryStatusCodeValue>/).exec(xml);

  return parseInt(code);
}
