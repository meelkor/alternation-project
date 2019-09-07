const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    context: process.cwd(),
    entry: path.resolve(__dirname, './src/poc/index.ts'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    mode: 'development',
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.tsx', '.ts', '.sass'],
        plugins: [
            new TsconfigPathsPlugin(),
        ],
        alias: {
            'jsx-dom': path.resolve(__dirname, './node_modules/jsx-dom/svg.js')
        }
    },
    plugins: [
        new HtmlWebpackPlugin(),
    ],
};
