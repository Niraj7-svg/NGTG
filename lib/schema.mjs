// Single source of truth for field rules. Used by the site (lib/content.js, components) and by `npm run check`.
export const required = { devlog: ['title', 'date'], work: ['title'], testimonials: ['name'], growth: ['milestones'], story: ['title'], home: [] }
export const TAGS = ['mechanic', 'bug', 'cinematic']           // these three have a colour; any other tag shows plain
export const WORK_TYPES = ['showreel', 'reel', 'video']
export const ICONS = ['email', 'instagram', 'linkedin', 'youtube', 'github', 'artstation']   // keep in sync with components/Icon.jsx
export const INSTAGRAM = /instagram\.com\/(?:reels?|p)\/([^/?#]+)/
export const EMAIL = /^[^:/\s]+@[^:/\s]+$/
export const DATE = /^\d{4}-\d{2}-\d{2}$/
export const IMAGE_STYLES = ['clipping', 'polaroid', 'cutout']
export const SIDES = ['left', 'right']
export const COLORS = ['yellow', 'coral', 'sage', 'sky', 'pink']
