// Validated categorical palette (dataviz skill — run scripts/validate_palette.js
// before changing this). Fixed order, never cycled or reassigned per-render —
// every chart that ranks entities by index (muscle groups, exercises, ...)
// draws from this same array so color stays consistent across the dashboard.
export const CATEGORICAL_COLORS = ['#565FBE', '#C96936', '#28937A', '#8F4F7E', '#C9971E', '#B4577B'];
export const CATEGORICAL_OTHER_COLOR = '#C7BC9F';
