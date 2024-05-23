import oss from 'ali-oss';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import os from 'os'

const ossUserDataPath = path.resolve(os.homedir(), './.fastoss/oss.json')

function writeFileSync(anyPath, data) {
    if (data == null && fs.existsSync(anyPath)) {
        return true;
    } else {
        if (writeFileSync(path.dirname(anyPath), null)) {
            if (data != null) {
                fs.writeFileSync(anyPath, data)
            } else {
                fs.mkdirSync(anyPath);
            }
            return true;
        }
    }
}

export function createOssUserData(options: OssInitOptions):void {
    const data = JSON.stringify(options, undefined, 4)
    writeFileSync(ossUserDataPath, data)
}

export function getOssUserData(): OssInitOptions {
    let ossUserData
    try {
        ossUserData = fs.readFileSync(ossUserDataPath).toString()
        return JSON.parse(ossUserData)
    } catch(e) {
        console.log(chalk.red('获取oss本地信息失败，使用 --init 重新创建oss本地信息'))
    }

}

interface OssInitOptions {
    accessKeyId: string;
    accessKeySecret: string;
    bucket?: string;
    region?: string;
}
function getStore({accessKeyId, accessKeySecret, bucket, region}: OssInitOptions): any {
    return oss({
        accessKeyId,
        accessKeySecret,
        bucket,
        region
    })
}

let store = null;

export function readAllFilesPath(anyPath: string): any[] {
    let filePathList = []
    try {
        // recursively find all files
        fs.readdirSync(anyPath).forEach((p) => {
            const recurseFilePathList = readAllFilesPath(path.resolve(anyPath, p))
            filePathList.push(...recurseFilePathList)
        })
    } catch(e) {
        // not a directory
        if (fs.existsSync(anyPath)) {
            filePathList.push(anyPath)
        }
    }
    return filePathList
}

export async function ossGet(ossPath: string): Promise<any> {
    try {
        return await store.get(ossPath)
    } catch (e) {}
    return false
}

interface OssPutOptions {
    source: string;
    target?: string;
    targetFile?: string;
    overwrite?: boolean;
    filePutOptions?: any;
}
export async function ossPut({source, target, targetFile, overwrite = false, filePutOptions = {}}: OssPutOptions): Promise<void> {
    let sourceDir = source
    let onlyOneFile = false
    try {
        if (fs.statSync(source).isFile()){
            sourceDir = path.dirname(source)
            onlyOneFile = true
        }
    } catch(e){}
    if (targetFile) {
        if (!onlyOneFile) {
            console.log(chalk.red('指明了远程是一个确切的文件，本地也必须是一个确切的文件'))
            return
        }
        if (!overwrite && await ossGet(targetFile)) {
            console.log(chalk.red(`${targetFile}已经存在，并且当前是不可覆盖模式！`))
            return
        }
        const result = await store.put(targetFile, source)
        console.log(chalk.green(`${result.name}上传成功！`))
        return
    }
    const filesPathList = readAllFilesPath(source)
    if (filesPathList.length === 0) {
        console.log(chalk.red('没有本地文件可上传！'))
        return
    }
    for (let filePath of filesPathList) {
        let ossRelativePath = filePath.replace(sourceDir, '')
        // windows path convert to unix path
        ossRelativePath = ossRelativePath.replace(/\\/g, '/')
        const ossPath = target + ossRelativePath
        if (!overwrite && await ossGet(ossPath)) {
            console.log(chalk.red(`${ossPath}已经存在，并且当前是不可覆盖模式！`))
            continue
        }
        try {
            const result = await store.put(ossPath, filePath, filePutOptions)
            console.log(chalk.green(`${result.name}上传成功！`))
        } catch(e) {
            throw Error(e)
        }

    }
}

export async function ossCheck(ossInitOptions: OssInitOptions): Promise<boolean> {
    const tempStore = getStore(ossInitOptions)
    try {
        const result = await tempStore.list({
            'max-keys': 1
        })
        store = tempStore
        return true
    } catch(e) {}
    return false
}
