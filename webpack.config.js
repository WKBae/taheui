const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/aheui.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'aheui.min.js',
        library: {
            name: 'aheui',
            type: 'umd'
        },
        globalObject: 'this'
    },
}