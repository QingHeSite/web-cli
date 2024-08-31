import resolve from '@rollup/plugin-node-resolve'
import path from 'node:path'
import typescript from "rollup-plugin-typescript2";
import babel from "@rollup/plugin-babel";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import  terser from '@rollup/plugin-terser';

const env = process.env.NODE_ENV // umd 模式的编译结果文件输出的全局变量名称
console.log('env', env)
// console.log('路径',path.relative('/','/entry.ts' ))
const config = {
  // 入口
  input: path.join('../src/index.ts'),
  output:  [
    {
      file: 'dist/index.cjs.js',
        format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    }
  ],
  plugins: [typescript(), babel({
    babelHelpers: 'bundled',
    // 过滤文件
    exclude: "node_modules/**",
  }), resolve({preferBuiltins: true,}), commonjs(), json()],
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