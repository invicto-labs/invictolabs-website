# Header navigation

The primary order on desktop and mobile is Home, Services, Our Approach, Locations, Products, Our Company, Resources. At widths up to 1280 CSS pixels the header uses the hamburger and a viewport dialog. The footer's Explore group uses the same primary order and lists resource pages individually.

On Home, Services, Our Approach and Locations jump to existing sections. The mapping in `src/data/homeNavigation.ts` pairs each route with a section ID, a flow marker and a heading ID. The marker stays in the document flow when a section sticks. Home links focus the heading, account for the sticky header and replace the current hash. Older Home hashes continue to resolve to their original routes.

The scroll spy observes the mapped sections in a band around 36–45% of the viewport, adjusted for header height. If sticky panels overlap, the later panel takes priority. Between mapped sections, the last one remains active. Products and Our Company navigate to their pages. Away from Home, primary items navigate to their routes and child routes highlight the parent. Resources highlights on Blogs, Workflow Walkthroughs and FAQ routes.

To add a Home target, add a route mapping, a marker before the section in `App.tsx` with its `data-focus-heading` pointing to the heading, and matching IDs on the section and heading. Keep the map in page order and extend the navigation regression.

The desktop indicator follows the one item marked `aria-current`. A resize observer and font events trigger remeasurement. The mobile menu uses a static highlight. Reduced-motion settings disable the slide and smooth scrolling.

Run `npm run test:nav:regression` for the Home, route and responsive navigation checks. Run `npm run test:menu:regression` for the dedicated menu matrix.
