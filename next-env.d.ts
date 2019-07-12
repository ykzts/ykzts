/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace JSX {
  interface AmpAnalytics {
    children: Element
    type: string
  }

  interface IntrinsicElements {
    'amp-analytics': AmpAnalytics
  }
}
