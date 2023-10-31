const esbuild = require('esbuild');
const fs = require('fs');

// dynamic-required files
const dynamicRequiredDirs = ['views']

// static files
const staticFileDirs = ['public']

// Remove old output
if(fs.existsSync('.zeabur/output')) {
    console.info('Removing old .zeabur/output')
    fs.rmSync('.zeabur/output', { recursive: true })
}

// build with esbuild
try {
    esbuild.build({
        entryPoints: ['app.js'],
        bundle: true,
        minify: true,
        sourcemap: true,
        outdir: '.zeabur/output/functions/index.func',
        platform: 'node',
        target: 'node20',
    }).then(res => {
        if(res.errors.length > 0) {
            console.error(res.errors)
            process.exit(1)
        }
        console.info('Successfully built app.js into .zeabur/output/functions/index.func')
    })
} catch (error) {
    console.error(error)
}

// copy dynamic-required files into function output directory, so they can be required during runtime
dynamicRequiredDirs.forEach(dir => { copyIfDirExists(dir, `.zeabur/output/functions/index.func/${dir}`) })

// copy static files into function output directory, so they can be served by the web server directly
staticFileDirs.forEach(dir => { copyIfDirExists(dir, `.zeabur/output/static`) })

function copyIfDirExists(src, dest) {
    if(fs.statSync(src).isDirectory()) {
        console.info(`Copying ${src} to ${dest}`)
        fs.cp(src, dest, { recursive: true }, (err) => {
            if (err) throw err;
        });
        return
    }
    console.warn(`${src} is not a directory`)
}
