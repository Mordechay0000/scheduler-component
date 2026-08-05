import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import visualizer from 'rollup-plugin-visualizer';


const plugins = [
  nodeResolve(),
  commonjs({
    include: 'node_modules/**',
  }),
  // The plugin's default include patterns ('*.ts+(|x)') match nothing under
  // the installed picomatch, so every .ts file was silently handed to the
  // JS parser instead of TypeScript. Spell the patterns out explicitly.
  typescript({ include: ['*.ts', '**/*.ts', '*.tsx', '**/*.tsx'] }),
  json(),
  visualizer(),
  terser(),
];

export default [
  {
    input: 'src/scheduler-card.ts',
    output: {
      // The integration serves this file and registers it with the frontend,
      // so the build lands inside the component folder that HACS installs.
      dir: 'custom_components/scheduler/frontend',
      format: 'iife',
      sourcemap: false,
      // An installation that still has the standalone card registered as a
      // Lovelace resource would define these elements twice, and the second
      // customElements.define() throws before the bundle finishes evaluating.
      // Skip the whole bundle instead of taking down the page.
      banner: "if (!customElements.get('scheduler-card')) {",
      footer: '}',
    },
    plugins: [...plugins],
    context: 'window',
  },
];
