import { json } from '../helpers/evidence.mjs'
export async function run({ base, inventory }) {
  const internal = [],
    external = [],
    anchors = [],
    protocols = []
  for (const pathname of [
    ...new Set(inventory.edges.filter((e) => e.internal).map((e) => e.path)),
  ]) {
    const response = await fetch(base + pathname, { redirect: 'manual' })
    const html = await response.text()
    internal.push({
      path: pathname,
      status: response.status,
      location: response.headers.get('location'),
      linkedFrom: [
        ...new Set(
          inventory.edges.filter((e) => e.internal && e.path === pathname).map((e) => e.from),
        ),
      ],
    })
    for (const edge of inventory.edges.filter((e) => e.internal && e.path === pathname && e.hash))
      anchors.push({
        ...edge,
        exists: html.includes(`id="${decodeURIComponent(edge.hash.slice(1))}"`),
      })
  }
  for (const href of inventory.external) {
    try {
      let response = await fetch(href, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
      })
      const headStatus = response.status
      if ([405, 501].includes(response.status))
        response = await fetch(href, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
        })
      external.push({
        href,
        status: response.status,
        headStatus,
        finalURL: response.url,
        classification: [404, 410].includes(response.status)
          ? 'error'
          : response.status >= 400
            ? 'blocked/unverified'
            : 'reachable',
      })
    } catch (error) {
      external.push({ href, error: String(error), classification: 'unverified' })
    }
  }
  for (const route of inventory.routes) {
    const html = await (await fetch(base + route)).text()
    for (const m of html.matchAll(/href="((mailto:|tel:)[^"]*)"/g)) {
      protocols.push({
        route,
        href: m[1],
        valid:
          m[2] === 'mailto:' ? /^mailto:[^?\s]+@[^?\s]+/.test(m[1]) : /^tel:\+?[\d-]+$/.test(m[1]),
      })
    }
  }
  const result = {
    internal,
    external,
    anchors,
    protocols,
    orphans: inventory.orphans,
    externalBlankWithoutExplicitNoopener: inventory.edges.filter(
      (e) => e.target === '_blank' && !/noopener/.test(e.rel || ''),
    ),
    note: 'Modern target=_blank has implicit noopener. rel=noreferrer also suppresses opener; explicit token absence alone is not proof of a vulnerability.',
  }
  await json('links.json', result)
  return {
    internalURLs: internal.length,
    brokenInternal: internal.filter((r) => r.status >= 400).length,
    brokenExternal: external.filter((r) => r.classification === 'error').length,
    externalUnverified: external.filter((r) => r.classification.includes('unverified')).length,
    missingAnchors: anchors.filter((r) => !r.exists).length,
    failures:
      internal.filter((r) => r.status >= 400).length + anchors.filter((r) => !r.exists).length,
  }
}
