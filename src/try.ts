/* eslint-disable node/prefer-global/process */

// 获取当前文件地址

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import c from 'picocolors'
import { deployCheck } from '.'

// const root = dirname(fileURLToPath(import.meta.url))
const root = resolve(fileURLToPath(import.meta.url), '../..')
// 找到playground/dist打包生产文件
const servePath = resolve(root, 'playground/dist')

const logs = await deployCheck({
  servePath,
})

if (logs.length) {
  console.error(c.inverse(c.red(' DEPLOY CHECK')) + c.red(` ${logs.length} Runtime errors found`))
  logs.forEach((log) => {
    if (log.type === 'error')
      console.error(log.error)
    else
      console.error(...log.arguments)
  })
  process.exit(1)
}
else {
  process.exit(0)
}
