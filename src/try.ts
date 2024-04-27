/* eslint-disable node/prefer-global/process */

// 获取当前文件地址

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { printErrorLogs, serveAndCheck } from '.'

// const root = dirname(fileURLToPath(import.meta.url))
const root = resolve(fileURLToPath(import.meta.url), '../..')
// 找到playground/dist打包生产文件
const servePath = resolve(root, 'playground/dist')

const logs = await serveAndCheck({
  servePath,
})

if (logs.length) {
  printErrorLogs(logs)
  process.exit(1)
}
else {
  process.exit(0)
}
