/* eslint-disable no-console */
/* eslint-disable node/prefer-global/process */
import { resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { type Options, printErrorLogs, serveAndCheck } from './index'

export default function VitePluginDeployCheck(
  options?: Partial<Options>,
): Plugin {
  let config: ResolvedConfig = undefined!

  return {
    name: 'vite-plugin-check-build',
    apply: 'build',
    enforce: 'post',
    configResolved(_config) {
      config = _config
      console.log('RUNNING')
    },
    buildEnd: {
      order: 'post',
      sequential: true,
      handler() {
        async function deployCheck() {
        //   console.log({ build: config?.build.outDir })
          const logs = await serveAndCheck({
            servePath: resolve(config.root, config?.build.outDir),
            ...options,
          })
          if (logs.length) {
            printErrorLogs(logs)
            process.exit(1)
          }
          else {
            process.exit(0)
          }
        }
        deployCheck().catch((e) => {
          console.error(e)
          process.exit(1)
        })
      },
    },
  }
}
