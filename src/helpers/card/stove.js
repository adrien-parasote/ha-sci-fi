import {LitElement, css, html, svg} from 'lit';

import common_style from '../common_style.js';

const SVG_VIEWBOX_WIDTH = 124;
const SVG_VIEWBOX_HEIGHT = 480;

class SciFiStoveImage extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --stove-primary-color: #181818;
          --stove-secondary-color: #303030;
          --stove-tertiary-color: #383838;
          --line-color: #343434;
        }
        :host > * {
          width: 100%;
          height: 100%;
        }
      `,
    ];
  }

  static get properties() {
    return {
      active: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.active = this.active ? this.active : false;
  }

  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}"
      >
        ${this.__getDefs()} ${this.__getCommons()}
        ${this.active ? this.__getActive() : this.__getInactive()}
      </svg>
    `;
  }

  __getDefs() {
    return svg`
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="600" id="gradient-stove-right" gradientTransform="matrix(0, 9.6, -0.066666, 0, 116.040375, -960.000549)">
        <stop offset="0" style="stop-color: var(--stove-secondary-color);"></stop>
        <stop offset="1" style="stop-color: var(--stove-primary-color);"></stop>
      </linearGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="245" r="120" id="gradient-stove-round" gradientTransform="matrix(1, 0, 0, 1, 0.059814, 0)">
        <stop offset="0" style="stop-color: var(--stove-primary-color);"></stop>
        <stop offset="0.7" style="stop-color: var(--stove-secondary-color);"></stop>
        <stop offset="1" style="stop-color: var(--stove-tertiary-color);"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="335" r="45" id="gradient-pellet-dug-off">
        <stop offset="0" style="stop-color: #FFFEE7"></stop>
        <stop offset="1" style="stop-color: #000000"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="320" r="50" id="gradient-pellet-dug-on" gradientTransform="matrix(1, 0, 0, 1, -0.000214, 0.00021)">
        <stop offset="0" style="stop-color: #D3AA6D"></stop>
        <stop offset="1" style="stop-color: #000000"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="320" r="150" id="gradient-inside-off">
        <stop offset="0" style="stop-color: rgb(100% 99.608% 90.588%)"></stop>
        <stop offset="1" style="stop-color: rgb(56.91% 56.632% 48.5%)"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="320" r="200" id="gradient-inside-on">
        <stop offset="0" style="stop-color: #FCCD64"></stop>
        <stop offset="1" style="stop-color: #823A16"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="240" r="200" id="gradient-outside-on">
        <stop offset="0" style="stop-color: #FF0000"></stop>
        <stop offset="1" style="stop-color: rgba(0,0,0,0)"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="130" r="130" id="gradient-fire-3" gradientTransform="matrix(0.835512, 0, 0, 0.835512, -0.000396, 193.999878)">
        <stop offset="0" style="stop-color: #FF9A00"></stop>
        <stop offset="1" style="stop-color: #FF0000"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="145" r="100" id="gradient-fire-2" gradientTransform="matrix(0.835512, 0, 0, 0.835512, -0.000396, 193.999878)">
        <stop offset="0" style="stop-color: #FFE808"></stop>
        <stop offset="1" style="stop-color: #FF5A00"></stop>
      </radialGradient>
      <radialGradient gradientUnits="userSpaceOnUse" cx="0" cy="152" r="70" id="gradient-fire-1" gradientTransform="matrix(0.835512, 0, 0, 0.835512, -0.000396, 193.999878)">
        <stop offset="0" style="stop-color: #FFFFFF"></stop>
        <stop offset="1" style="stop-color: #FF9A00"></stop>
      </radialGradient>
    </defs>`;
  }

  __getCommons() {
    return svg`
    <g>
      <rect width="116" height="480" style="fill: var(--stove-primary-color);"></rect>
      <path d="M 116.04 0 L 116.04 480 L 76.04 480 L 76.04 318.615 C 96.44 298.647 109.1 270.802 109.1 240 C 109.1 209.198 96.44 181.354 76.04 161.385 L 76.04 0 L 116.04 0 Z" style="opacity: 0.6; fill: url(#gradient-stove-right);"></path>
      <path d="M 109.06 240 C 109.06 300.438 60.319 349.491 0 349.996 L 0 130.004 C 60.319 130.509 109.06 179.562 109.06 240 Z" style="fill: url(#gradient-stove-round); opacity: 0.9;"></path>
    </g>
    <g>
      <line style="stroke-width: 2px; stroke: var(--line-color); fill: var(--line-color);" x1="114" y1="0" x2="114" y2="480"></line>
      <path style="stroke-width: 4px; stroke: var(--line-color); fill: none;" d="M 0 95 L 14.77 94.9805 C 29.54 94.961 59.08 94.92 78.08 96.40 C 97.08 97.88 105.54 100.89 109.77 102.39 L 114 103.9"></path>
      <path style="stroke-width: 4px; stroke: var(--line-color); fill: none;" d="M 0.06 385.124 L 14.83 385.14 C 29.60 385.163 59.14 385.202 78.13 383.68 C 97.12 382.16 105.56 379.08 109.78 377.54 L 114 376"></path>
    </g>
    <g>
      <path d="M 100.265 238.655 C 100.265 247.45 101.587 255.282 103.647 260.322 L 110.072 260.961 L 109.794 217.46 L 103.189 218.184 C 101.394 223.224 100.265 230.528 100.265 238.655 Z" style="fill: #000000; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, -0.000012, -0.000017)"></path>
      <path d="M 109.28 240.047 C 109.28 230.636 108.042 221.515 105.72 212.837 L 105.72 212.431 L 121.087 212.431 C 123.175 221.297 124.28 230.543 124.28 240.047 C 124.28 249.517 123.183 258.731 121.109 267.569 L 105.72 267.569 L 105.72 267.257 C 108.042 258.579 109.28 249.458 109.28 240.047 Z" style="fill: #96642C;"></path>
      <path d="M 105.7 212.806 L 105.7 212.4 L 107.299 212.4 C 107.23 214.84 107.284 217.285 107.301 219.727 C 106.844 217.391 106.309 215.083 105.7 212.806 Z M 121.089 267.538 L 120.51 267.538 C 120.55 267.265 120.587 266.992 120.621 266.719 C 120.822 266.865 120.743 266.582 120.657 266.434 C 121.114 262.625 121.097 258.748 120.539 254.944 C 119.689 254.867 121.12 259.801 120.745 261.492 C 119.962 263.416 120.096 265.484 120.011 267.538 L 119.383 267.538 C 119.446 267.378 119.539 267.231 119.673 267.103 C 119.373 262.37 119.371 257.62 118.929 252.896 C 118.713 251.723 118.521 250.547 118.352 249.37 C 118.232 248.996 118.184 248.585 118.185 248.146 C 116.693 236.634 117.35 224.931 118.625 213.416 C 118.662 212.969 118.686 212.636 118.701 212.4 L 119.257 212.4 C 117.729 223.969 118.179 225.604 118.278 231.945 C 118.385 236.202 118.407 240.481 118.714 244.733 C 119.088 242.952 119.408 241.145 118.696 239.767 C 118.586 233.169 118.454 226.555 118.75 219.958 C 118.6 217.844 119.582 214.481 119.636 212.4 L 119.988 212.4 C 119.58 214.471 120.111 217.114 119.824 219.302 C 118.265 222.746 119.699 226.465 119.309 230.033 C 119.109 240.045 121.536 250.743 122.129 261.436 C 121.765 262.795 121.633 264.199 121.524 265.614 C 121.384 266.257 121.239 266.898 121.089 267.538 Z M 105.7 267.538 L 105.7 267.226 C 106.225 265.266 106.694 263.283 107.106 261.279 C 107.161 263.213 107.215 265.147 107.264 267.08 L 107.271 267.522 L 107.271 267.538 L 105.7 267.538 Z M 109.15 216.275 C 108.86 215.505 109.28 213.707 109.356 212.4 L 109.967 212.4 C 109.546 215.984 109.665 219.715 109.51 223.339 C 109.304 227.167 109.178 230.999 109.134 234.832 C 109.028 232.655 108.856 230.495 108.62 228.355 C 108.666 224.377 108.821 220.354 109.15 216.275 Z M 110.864 264.914 C 109.698 243.443 109.349 224.115 110.001 237.163 C 110.003 236.332 110.011 235.501 110.026 234.67 C 110.001 227.233 110.72 219.825 110.984 212.4 L 113.111 212.4 C 112.842 214.616 113.592 218.171 112.865 220.074 C 112.453 227.641 111.391 235.55 114.162 242.82 C 113.777 251.055 113.882 259.303 113.556 267.538 L 111.537 267.538 C 111.647 265.58 111.651 263.07 111.552 261.374 C 111.193 258.285 110.879 255.189 110.629 252.087 C 110.691 253.712 110.755 255.454 110.823 257.317 C 111.504 260.696 111.216 264.121 111.197 267.538 L 110.881 267.538 C 110.898 266.518 110.842 265.468 110.864 264.914 Z M 109.894 227.449 C 109.748 224.438 109.893 221.424 110.081 218.418 C 110.068 216.471 110.531 214.328 110.422 212.4 L 110.755 212.4 C 110.202 217.394 110.46 222.452 109.894 227.449 Z M 109.734 255.874 C 110.171 259.745 110.438 263.647 110.221 267.538 L 109.419 267.538 C 109.492 260.931 109.236 254.295 108.992 247.572 C 109.077 246.381 109.142 245.184 109.186 243.982 C 109.278 247.949 109.459 251.914 109.734 255.874 Z M 109.282 240.684 C 109.501 240.826 109.36 240.878 109.257 240.858 C 109.257 240.805 109.257 240.752 109.258 240.699 C 109.265 240.694 109.273 240.689 109.282 240.684 Z M 115.334 264.239 C 115.991 262.385 114.814 257.685 117.312 257.954 C 117.957 261.087 117.564 264.339 117.635 267.538 L 117.325 267.538 C 117.402 265.832 117.25 263.647 117.001 262.241 C 115.613 262.183 115.552 265.058 115.37 267.538 L 114.993 267.538 C 115.093 266.405 115.134 265.244 115.334 264.239 Z M 118.424 261.555 C 118.598 261.691 118.471 261.337 118.41 261.284 C 118.353 260.194 118.278 259.104 118.156 258.016 C 117.237 250.352 116.199 241.748 116.79 234.915 C 116.909 231.554 116.691 228.171 115.241 225.088 C 113.687 220.99 114.57 216.648 114.468 212.4 L 115.545 212.4 C 115.239 213.663 115.082 217.241 115.501 219.952 C 116.18 218.787 116.223 217.346 116.382 216.037 C 116.514 216.126 116.433 215.872 116.372 215.78 C 116.273 214.023 116.147 212.951 116.014 212.4 L 117.152 212.4 C 117.11 212.619 117.049 212.925 116.967 213.333 C 116.627 216.267 117.975 219.378 116.823 222.172 C 113.126 222.219 117.069 225.174 117.224 227.195 C 116.947 232.423 116.926 237.669 117.339 242.891 C 118.203 251.073 119.395 259.297 119.05 267.538 L 118.722 267.538 C 118.565 265.546 118.522 263.55 118.424 261.555 Z M 116.027 264.509 C 117.29 264.058 117.213 265.843 117.049 267.538 L 115.806 267.538 C 115.92 266.479 115.89 265.423 116.027 264.509 Z M 118.176 216.128 C 116.742 216.961 117.04 213.643 117.188 212.4 L 118.615 212.4 C 118.477 213.321 118.242 215.33 118.176 216.128 Z M 120.46 240.78 C 120.642 229.184 119.849 223.49 120.868 214.914 C 120.892 214.567 121.044 213.755 121.183 212.898 C 121.902 216.01 122.5 219.168 122.971 222.368 C 122.875 222.767 122.781 223.167 122.693 223.568 C 121.13 228.994 122.196 234.635 123.23 240.045 C 123.048 241.529 123.649 242.226 124.244 242.017 C 124.152 247.631 123.675 253.15 122.837 258.551 C 122.754 252.72 122.073 246.697 120.46 240.78 Z M 122.893 234.19 C 122.381 231.232 122.76 228.264 123.372 225.347 C 123.43 225.817 123.484 226.286 123.536 226.757 C 122.861 229.216 122.535 231.735 123.522 234.174 C 123.787 234.99 123.997 235.345 124.173 235.395 C 124.193 235.93 124.21 236.466 124.223 237.003 C 123.374 236.818 122.474 235.692 122.893 234.19 Z M 119.376 250.715 C 119.376 250.715 119.376 250.715 119.376 250.715 C 119.376 250.715 119.376 250.716 119.376 250.716 L 119.376 250.715 Z M 122.223 223.599 C 122.809 220.127 121.664 223.505 121.587 224.996 C 121.982 224.638 122.147 224.109 122.223 223.599 Z M 110.001 237.163 C 109.994 242.144 110.229 247.123 110.629 252.087 C 110.363 245.069 110.155 240.225 110.001 237.163 Z M 118.185 248.146 C 118.238 248.554 118.294 248.962 118.352 249.37 C 118.524 249.906 118.843 250.364 119.376 250.715 C 119.066 248.73 118.858 246.735 118.714 244.733 C 118.463 245.929 118.188 247.113 118.185 248.146 Z M 108.247 225.369 C 108.04 223.891 107.803 222.424 107.536 220.967 C 107.514 218.159 107.487 215.311 107.469 212.4 L 108.48 212.4 C 108.383 216.749 108.304 221.059 108.247 225.369 Z M 108.447 267.538 L 108.053 267.538 C 107.622 264.429 107.582 261.796 107.553 258.972 C 107.802 257.609 108.024 256.237 108.219 254.856 C 108.27 259.003 108.345 263.221 108.447 267.538 Z" style="fill: #8C5829;"></path>
    </g>
    `;
  }

  __getInactive() {
    return svg`
    <g>
      <path d="M 96.97 239.972 C 96.97 293.534 53.558 336.956 0 336.972 L 0 142.972 C 53.558 142.988 96.97 186.41 96.97 239.972 Z" style="fill: #FFFEE7;"></path>
      <g>
        <path d="M 100 240 C 100 295.228 55.228 340 0 340 L 0 337 C 53.571 337 97 293.571 97 240 C 97 186.429 53.571 143 0 143 L 0 140 C 55.228 140 100 184.772 100 240 Z" style="fill: #000000;"></path>
        <path d="M 103 240 C 103 296.885 56.885 343 0 343 L 0 339.91 C 55.178 339.91 99.91 295.178 99.91 240 C 99.91 184.822 55.178 140.09 0 140.09 L 0 137 C 56.885 137 103 183.115 103 240 Z" style="fill: var(--stove-primary-color);"></path>
      </g>
      <g>
        <path d="M 2 330.028 L 2 149.973 C 17.301 149.978 31.645 154.364 44 162.025 L 44 317.977 C 31.645 325.637 17.301 330.023 2 330.028 Z M 89.5 240 C 89.5 273.318 71.402 302.408 44.5 317.976 L 44.5 162.024 C 71.402 177.592 89.5 206.682 89.5 240 Z" style="fill: #FFFEE7; stroke: #f9edd8; stroke-linejoin: round; stroke-linecap: round; stroke-width: 2px;"></path>
      </g>
      <path d="M 96.97 240 C 96.97 293.562 53.558 336.984 0 337 L 0 143 C 53.558 143.016 96.97 186.438 96.97 240 Z" style="fill: url(#gradient-inside-off); opacity: 0.8;"></path>
      <g>
        <path d="M 9.16 315.8 C 18.782 315.8 26.585 323.603 26.585 333.229 L 26.585 333.29 C 18.136 335.693 9.22 336.979 0 336.979 L 0 315.8 L 9.16 315.8 Z" style="fill: #FFFEE7"></path>
        <path d="M 9.16 315.8 C 18.782 315.8 26.585 323.603 26.585 333.229 L 26.585 333.29 C 18.136 335.693 9.22 336.979 0 336.979 L 0 315.8 L 9.16 315.8 Z" style="fill: url(#gradient-pellet-dug-off); opacity: 0.6;"></path>
      </g>
    </g>
    `;
  }

  __getActive() {
    return svg`
    <g>
      <path d="M 96.97 239.972 C 96.97 293.534 53.558 336.956 0 336.972 L 0 142.972 C 53.558 142.988 96.97 186.41 96.97 239.972 Z" style="fill: #FFFEE7;"></path>
      <g>
        <path d="M 100 240 C 100 295.228 55.228 340 0 340 L 0 337 C 53.571 337 97 293.571 97 240 C 97 186.429 53.571 143 0 143 L 0 140 C 55.228 140 100 184.772 100 240 Z" style="fill: #000000;"></path>
        <path d="M 103 240 C 103 296.885 56.885 343 0 343 L 0 339.91 C 55.178 339.91 99.91 295.178 99.91 240 C 99.91 184.822 55.178 140.09 0 140.09 L 0 137 C 56.885 137 103 183.115 103 240 Z" style="fill: var(--stove-primary-color);"></path>
      </g>
      <g>
        <path d="M 2 330.028 L 2 149.973 C 17.301 149.978 31.645 154.364 44 162.025 L 44 317.977 C 31.645 325.637 17.301 330.023 2 330.028 Z M 89.5 240 C 89.5 273.318 71.402 302.408 44.5 317.976 L 44.5 162.024 C 71.402 177.592 89.5 206.682 89.5 240 Z" style="fill: #FFFEE7; stroke: #f9edd8; stroke-linejoin: round; stroke-linecap: round; stroke-width: 2px;"></path>
      </g>
      <g>
        <path d="M 37.147 228.75 C 44.473 238.139 50.135 249.958 50.135 263.191 C 50.135 283.958 38.969 305.699 20.286 315.684 C 16.153 317.895 11.621 319.381 6.916 320.166 C 4.541 320.564 2.235 320.815 0 320.928 L 0 194 C 21.568 205.843 32.539 223.582 29.909 247.117 C 34.086 244.811 36.168 237.951 37.147 228.75 Z" style="fill: url(#gradient-fire-3);"></path>
        <path d="M 11.202 218.232 C -3.438 237.223 23.68 257.797 25.174 277.519 C 28.677 271.54 30.668 263.558 31.062 252.892 C 48.153 279.708 35.431 322.744 0.004 320.945 L 0.004 223.258 C 3.401 221.391 7.14 219.716 11.202 218.232 Z" style="fill: url(#gradient-fire-2);"></path>
        <path d="M 20.898 269.11 C 25.019 274.391 28.203 281.039 28.203 288.482 C 28.203 300.162 21.921 312.392 11.412 318.009 C 9.087 319.253 6.54 320.088 3.89 320.531 C 2.557 320.753 1.26 320.895 0.004 320.959 L 0.004 249.563 C 12.134 256.224 18.306 266.202 16.826 279.439 C 19.174 278.143 20.346 274.283 20.898 269.11 Z" style="fill: url(#gradient-fire-1);"></path>
      </g>
      <path d="M 96.97 240 C 96.97 293.562 53.558 336.984 0 337 L 0 143 C 53.558 143.016 96.97 186.438 96.97 240 Z" style="fill: url(#gradient-inside-on); opacity: 0.8;"></path>
      <g>
        <path d="M 9.16 315.8 C 18.782 315.8 26.585 323.603 26.585 333.229 L 26.585 333.29 C 18.136 335.693 9.22 336.979 0 336.979 L 0 315.8 L 9.16 315.8 Z" style="fill: #FFFEE7"></path>
        <path d="M 9.16 315.8 C 18.782 315.8 26.585 323.603 26.585 333.229 L 26.585 333.29 C 18.136 335.693 9.22 336.979 0 336.979 L 0 315.8 L 9.16 315.8 Z" style="opacity: 0.6; fill: url(#gradient-pellet-dug-on);"></path>
      </g>
    </g>
    <rect width="116" height="480" style="fill: url(#gradient-outside-on); opacity: 0.3;"></rect>
  `;
  }
}

window.customElements.get('sci-fi-stove-image') ||
  window.customElements.define('sci-fi-stove-image', SciFiStoveImage);
