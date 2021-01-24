import {spawn as sp} from 'child_process'

export async function spawn(cmd, args, opts){
    return new Promise((resolve, reject) => {
        const child = sp(cmd, args, opts)
        let data = ''
        let error = ''
        child.stdout.on('data', (chunk) => {
            data += chunk.toString()
        })
        child.stderr.on('data', (chunk) => {
            error += chunk.toString()
        })
        child.on('close', (code) => {
            if (code) {
                reject(error)
            } else {
                resolve(data)
            }
        })
    })
}
