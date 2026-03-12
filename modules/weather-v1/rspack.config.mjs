import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import * as dotenv from 'dotenv';

dotenv.config();

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
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
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