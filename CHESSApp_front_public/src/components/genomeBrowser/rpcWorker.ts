import './workerPolyfill'
import { initializeWorker } from '@jbrowse/product-core'
import { enableStaticRendering } from 'mobx-react'

// locals
import corePlugins from '@jbrowse/react-linear-genome-view/esm/corePlugins'

// static rendering is used for "SSR" style rendering which is done on the
// worker
enableStaticRendering(true)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
initializeWorker(corePlugins, {})

export default function doNothing() {
  /* do nothing */
}