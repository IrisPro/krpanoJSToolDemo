import JSZipUtils from 'jszip-utils'

export function urlToBinaryContent(url: string): Promise<any> {
    return new Promise(function (resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err: any, data: any) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

export function getModules(module) {
    return Object.keys(module).reduce(
        (modules: { [key: string]: any }, path: string) => {
            const moduleName = path.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
            modules[moduleName] = module[path]?.default
            return modules
        },
        {}
    )
}
