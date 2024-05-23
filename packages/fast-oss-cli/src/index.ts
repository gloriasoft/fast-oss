#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { program } from 'commander'
import { ossPut, ossCheck, ossGet, readAllFilesPath, getOssUserData, createOssUserData } from 'fast-oss-core'
import os from 'os'
import prompts from 'prompts'
import chalk from 'chalk'

async function initOssUserData() {
    const options = await prompts([
        {
            type: 'text',
            name: 'accessKeyId',
            message: chalk.cyan('输入OSS的accessKeyId'),
            validate: value => value.trim() === '' ? `不能为空` : true
        },
        {
            type: 'text',
            name: 'accessKeySecret',
            message: chalk.cyan('输入OSS的accessKeySecret'),
            validate: value => value.trim() === '' ? `不能为空` : true
        },
        {
            type: 'text',
            name: 'bucket',
            message: chalk.cyan('输入OSS的bucket'),
            validate: value => value.trim() === '' ? `不能为空` : true
        },
        {
            type: 'text',
            name: 'region',
            message: chalk.cyan('输入OSS的region'),
            validate: value => value.trim() === '' ? `不能为空` : true
        }
    ])

    if (options.accessKeyId == null || options.accessKeySecret == null || options.bucket == null || options.region == null) {
        console.log(chalk.red('信息填写不完整！'))
        return
    }

    createOssUserData(options)
    console.log(chalk.green('OSS信息文件创建成功！'))
}

function getPackageJson() {
    const packageJsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../package.json')
    return JSON.parse(fs.readFileSync(packageJsonPath).toString())
}

program
  .option('-i, --init', '初始化oss登录信息')
  .option('-f, --force', '强行覆盖远程存在的文件')
  .option('-l, --local <path>', '指定要上传的本地文件或者目录')
  .option('-rd, --remoteDir <path>', '指定oss的远程目录')
  .option('-rf, --remoteFile <path>', '指定oss的远程文件')
  .option('--accessKeyId <keyId>', 'accessKeyId')
  .option('--accessKeySecret <keySecret>', 'accessKeySecret')
  .option('--bucket <bucket>', 'bucket')
  .option('--region <region>', 'region')
  .option('--headerCacheControl <headers cache-control>', '配置文件headers种的cache-control')

program.parse(process.argv);

const opts = program.opts()


async function main({ init, local, remoteDir, remoteFile, force, accessKeyId, accessKeySecret, bucket, region, headerCacheControl }: any): Promise<void> {
    console.log(chalk.bgBlue(`fast-oss nodejs 命令行工具 ${chalk.bgMagenta('版本: ' + getPackageJson().version)}`))

    if (init) {
        console.log(chalk.green('开始创建OSS信息文件，请按提示输入！'))
        await initOssUserData()
        return
    }

    if (local && (remoteDir || remoteFile)) {
        let ossCheckFlag
        if (accessKeyId != null || accessKeySecret !=null) {
            ossCheckFlag =await ossCheck({
                accessKeyId,
                accessKeySecret,
                bucket,
                region
            })
        } else {
            ossCheckFlag = await ossCheck({...getOssUserData(), ...bucket != null? {bucket}: {}, ...region != null? {region}: {}})
        }

        if (!ossCheckFlag) {
            console.log(chalk.red('OSS信息错误，重新在命令使用参数 --init 创建信息文件 或者使用参数 --accessKeyId --accessKeySecret --bucket --region 指明信息'))
            return
        }

        const target = remoteDir
        const targetFile = remoteFile
        const source = path.resolve(process.cwd(), local)
        await ossPut({source, target, targetFile, overwrite: force})
        return
    }

}
main(opts)
