/**
 * radiator-svg.ts — the radiator illustration.
 *
 * A static SVG with no interpolation and no component state, extracted from
 * sf-radiator.__displayImage() by ADR-017 step 7 (it was a 131-line function,
 * over the 100-line ceiling in .sentrux/rules.toml). An asset, not logic.
 */

import { html, type TemplateResult } from 'lit';

export const RADIATOR_SVG: TemplateResult = html`
<?xml version="1.0" encoding="utf-8"?>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 210"
        width="100px"
        height="210px"
      >
        <defs>
          <linearGradient
            x1="113.519"
            y1="127.222"
            x2="113.519"
            y2="327.222"
            id="gl"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-0.001038, -1, 0.069085, -0.000071, -8.829216, 113.537067)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="143.519"
            y1="127.222"
            x2="143.519"
            y2="327.222"
            id="gr"
            gradientTransform="matrix(-0.005887, 0.999983, -0.075024, -0.000442, 45.392197, -143.43744)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            x1="113.519"
            y1="127.222"
            x2="113.519"
            y2="327.222"
            id="gl1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-0.005477, -0.999985, 0.075758, -0.000415, 30.825578, 113.579361)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="143.519"
            y1="127.222"
            x2="143.519"
            y2="327.222"
            id="gr1"
            gradientTransform="matrix(0.008704, 0.999962, -0.056213, 0.000489, 77.202131, -143.618407)"
          >
            <stop offset="0" style="stop-color: #383838" />
            <stop offset="1" style="stop-color: #181818" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            x1="110"
            y1="188"
            x2="117"
            y2="188"
            id="steel"
            gradientTransform="matrix(1, 0, 0, 1, -30, -0.000001)"
          >
            <stop offset="0" style="stop-color: #99a3a3" />
            <stop offset="0.344" style="stop-color: #a8b0b2" />
            <stop offset="1" style="stop-color: #99a3a3" />
          </linearGradient>
        </defs>
        <g
          transform="matrix(1, 0, 0, 1, -1.1191048088221578e-13, -6.039613253960852e-14)"
        >
          <path
            d="M 0 0 L 71.149 0 C 73.276 0 75 1.724 75 3.851 L 75 196.149 C 75 198.276 73.276 200 71.149 200 L 0 200 Z"
            style="fill:#181818"
          />
          <rect
            width="15"
            height="200"
            style='fill: url("#gl"); opacity: 0.6;'
          />
          <rect
            x="20"
            width="15"
            height="200"
            style='fill: url("#gr"); opacity: 0.6;'
          />
          <rect
            width="15"
            height="200"
            style='fill: url("#gl1"); opacity: 0.6;'
            x="40"
          />
          <rect
            x="60"
            width="15"
            height="200"
            style='fill: url("#gr1"); opacity: 0.6;'
            rx="3.798"
            ry="3.798"
          />
        </g>
        <g>
          <path
            d="M 85.085 195.569 L 86 199 L 86 210 L 81 210 L 81 199 L 81.567 196.524 L 80 196 L 75 196 L 75 191 L 80 191 L 81.26 191.133 L 84.473 191.925 L 85.085 195.569 Z"
            style="fill: #cd9d70"
          />
          <rect
            x="80"
            y="188"
            width="7"
            height="11"
            style='fill: url("#steel");'
            rx="0.751"
            ry="0.751"
          />
          <rect x="75" width="5" height="5" style="fill:#cd9d70;" y="10" />
          <rect
            x="80"
            y="5"
            width="20"
            height="15"
            style="fill: #e5e3d9; stroke: #eaecec; stroke-width: 0.5px;"
            rx="1.007"
            ry="1.007"
          />
        </g>
      </svg>
`;
