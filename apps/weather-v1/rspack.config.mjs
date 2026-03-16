import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import * as dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

// Environment check
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('serve');

console.log('--- RSPACK BUILD MODE ---');
console.log('isDev:', isDev);
console.log('CSS Alias Path:', isDev ? 'standalone.css' : 'remote.css');
console.log('-------------------------');

export default defineConfig({
  context: import.meta.dirname,

  entry: './src/index.ts',
  
  devServer: {
    port: process.env.PORT || 3010,
    historyApiFallback: true,
    hot: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  output: {
    publicPath: 'auto',
    uniqueName: 'weather_v1',
  },
  optimization: {
    runtimeChunk: false, 
    moduleIds: 'named',
  },
  experiments: {
    css: true, // needed to load styles.css
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'postcss-loader' },
        ],
        type: 'css',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@app-styles': isDev 
        ? path.resolve(import.meta.dirname, 'src/styles/standalone.css') 
        : path.resolve(import.meta.dirname, 'src/styles/remote.css'),
      // Safety alias for your shared config package
      '@repo/tailwind-config': path.resolve(import.meta.dirname, '../../packages/tailwind-config'),
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    new ModuleFederationPlugin({
      name: 'weather_v1',
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, eager: false, requiredVersion: '19.2.4' },
        'react-dom': { singleton: true, eager: false, requiredVersion: '19.2.4' },
      },
    }),
  ],
});