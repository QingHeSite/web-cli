import resolve from '@rollup/plugin-node-resolve'
import path from 'node:path'
import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import process from 'node:process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV
console.log('env', env)

const config = {
  // 入口
  // input: path.join('../src/index.ts'),
  input: path.resolve(__dirname, '../src/index.ts'),
  output:  [
    // {
    //   file: 'dist/index.cjs.js',
    //     format: 'cjs',
    // },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true // 生成 sourcemap 文件
    }
  ],
  plugins: [typescript(), babel({
    babelHelpers: 'bundled',
    // 过滤文件
    exclude: "node_modules/**",
  }), resolve({preferBuiltins: true,browser: false}), commonjs(), json()],
  external: ['electron'],
}
if (env === 'production') {
  config.plugins.push(terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false
    }
  }))
}
export default config