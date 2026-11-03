export const homeTargets = {
  '/services': { anchor: 'home-services', section: 'services', heading: 'services-heading' },
  '/our-approach': { anchor: 'home-approach', section: 'approach', heading: 'approach-heading' },
  '/location': { anchor: 'home-locations', section: 'locations', heading: 'locations-heading' },
} as const

export type HomeSectionPath = keyof typeof homeTargets
