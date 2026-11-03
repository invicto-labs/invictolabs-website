export async function inspectLayout(page) {
  return page.evaluate(() => {
    const selector = (el) =>
      el.id
        ? `#${CSS.escape(el.id)}`
        : `${el.tagName.toLowerCase()}${[...el.classList]
            .slice(0, 3)
            .map((c) => '.' + CSS.escape(c))
            .join('')}`
    const rect = (el) => {
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, width: b.width, height: b.height, right: b.right, bottom: b.bottom }
    }
    const visible = (el) => {
      const c = getComputedStyle(el),
        r = el.getBoundingClientRect()
      return (
        c.display !== 'none' &&
        c.visibility !== 'hidden' &&
        Number(c.opacity) !== 0 &&
        r.width > 0 &&
        r.height > 0
      )
    }
    const items = [...document.querySelectorAll('body *')].filter(visible)
    const clipping = (el) => {
      let p = el.parentElement
      while (p) {
        const c = getComputedStyle(p)
        if (/hidden|clip|auto|scroll/.test(c.overflowX + ' ' + c.overflowY))
          return {
            selector: selector(p),
            overflowX: c.overflowX,
            overflowY: c.overflowY,
            rect: rect(p),
          }
        p = p.parentElement
      }
      return null
    }
    const containing = (el) => {
      const a = []
      let p = el.parentElement
      while (p) {
        const c = getComputedStyle(p)
        if (
          c.transform !== 'none' ||
          c.filter !== 'none' ||
          c.backdropFilter !== 'none' ||
          c.perspective !== 'none' ||
          c.contain !== 'none' ||
          c.willChange !== 'auto'
        )
          a.push({
            selector: selector(p),
            transform: c.transform,
            filter: c.filter,
            backdropFilter: c.backdropFilter,
            contain: c.contain,
            willChange: c.willChange,
            perspective: c.perspective,
          })
        p = p.parentElement
      }
      return a
    }
    const overflow = items
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.right > innerWidth + 1 || r.left < -1
      })
      .map((el) => ({
        selector: selector(el),
        ...rect(el),
        viewportWidth: innerWidth,
        position: getComputedStyle(el).position,
        transform: getComputedStyle(el).transform,
        clip: clipping(el),
      }))
    const decorative = items
      .filter((el) => {
        const c = getComputedStyle(el)
        return (
          ['absolute', 'fixed'].includes(c.position) ||
          el.tagName.toLowerCase() === 'svg' ||
          /gradient|url\(/.test(c.backgroundImage) ||
          /blur/.test(c.filter)
        )
      })
      .map((el) => {
        const c = getComputedStyle(el),
          r = el.getBoundingClientRect()
        return {
          selector: selector(el),
          ...rect(el),
          position: c.position,
          top: c.top,
          left: c.left,
          right: c.right,
          widthCSS: c.width,
          heightCSS: c.height,
          transform: c.transform,
          filter: c.filter,
          background: c.backgroundImage,
          pointerEvents: c.pointerEvents,
          ariaHidden: el.getAttribute('aria-hidden'),
          offViewport: r.right > innerWidth + 1 || r.left < -1,
          clip: clipping(el),
          containingBlockCandidates: containing(el),
        }
      })
    const pseudos = []
    for (const el of items) {
      for (const pseudo of ['::before', '::after']) {
        const c = getComputedStyle(el, pseudo)
        if (c.content !== 'none' && c.content !== 'normal' && c.display !== 'none')
          pseudos.push({
            selector: selector(el) + pseudo,
            parentRect: rect(el),
            position: c.position,
            width: c.width,
            height: c.height,
            left: c.left,
            right: c.right,
            top: c.top,
            bottom: c.bottom,
            transform: c.transform,
            filter: c.filter,
            background: c.backgroundImage,
            pointerEvents: c.pointerEvents,
            clip: clipping(el),
          })
      }
    }
    const targets = items
      .filter((el) => el.matches('a,button,input,select,textarea,summary,[role="button"]'))
      .map((el) => ({
        selector: selector(el),
        text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 110),
        ...rect(el),
        fontSize: getComputedStyle(el).fontSize,
      }))
      .filter((el) => el.width < 44 || el.height < 44)
    const smallInputs = items
      .filter(
        (el) =>
          el.matches('input,textarea,select') && parseFloat(getComputedStyle(el).fontSize) < 16,
      )
      .map((el) => ({ selector: selector(el), fontSize: getComputedStyle(el).fontSize }))
    const images = [...document.images].map((el) => ({
      src: el.currentSrc || el.src,
      width: el.getAttribute('width'),
      height: el.getAttribute('height'),
      aspectRatio: getComputedStyle(el).aspectRatio,
      loading: el.loading,
      fetchPriority: el.fetchPriority,
      naturalWidth: el.naturalWidth,
      rendered: rect(el),
      alt: el.getAttribute('alt'),
      srcset: el.srcset,
      sizes: el.sizes,
    }))
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollY,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      overflow,
      decorative,
      pseudos,
      smallTargets: targets,
      smallInputs,
      images,
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((el) => ({
        level: Number(el.tagName[1]),
        text: el.textContent.trim(),
        visible: visible(el),
      })),
    }
  })
}
