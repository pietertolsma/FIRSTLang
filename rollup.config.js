// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";

export default [{
    input: 'out-tsc/src/app.js',
    output: {
      file: 'bundle.js',
      format: 'cjs'
    },
    plugins: [typescript()]
  },
  {
    input: 'out-tsc/src/app.d.ts',
    output: {
      file: 'bundle.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  },

];