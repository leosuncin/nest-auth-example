declare module 'https://unpkg.com/@faker-js/faker@10.5.0/dist/index.js' {
  export * from '@faker-js/faker';
}

declare module 'https://unpkg.com/tv4@1.3.0/tv4.js' {
  export * as tv4 from 'tv4';

  export default tv4;
}

declare module 'https://jslib.k6.io/k6-summary/0.1.0/index.js' {
  export function textSummary(
    data: Record<string, unknown> | Record<string, unknown>[],
    options?: {
      indent?: string;
      enableColors?: boolean;
      summaryTimeUnit?: string;
      summaryTrendStats?: string;
    }
  ): string;
}

declare module 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js' {
  export default function formUrlencoded(
    data: Record<string, string | number | boolean>
  ): string;
}

declare module 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js' {
  export function htmlReport(
    data: Record<string, unknown> | Record<string, unknown>[],
    options?: { theme?: string; title?: string; debug?: boolean }
  ): string;
}
