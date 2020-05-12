import axeCore from 'axe-core'
import debounce from 'lodash.debounce'
import merge from 'lodash.merge'
import { checkAndReport, resetCache, resetLastNotification } from './utils'

export default function install (Vue, options) {
  // Browser only
  if (typeof window === 'undefined') return

  const defaultOptions = {
    clearConsoleOnUpdate: false,
    delay: 0,
    config: {
      checks: [{
        id: 'color-contrast',
        options: {
          noScroll: true
        }
      }]
    },
    runOptions: {
      reporter: 'v2',
      resultTypes: ['violations']
    },
    style: {
      head: 'padding:6px;font-size:20px;color:#333;font-weight:bold;',
      boldCourier: 'font-weight:bold;font-family:Courier;',
      moderate: 'padding:2px 4px;border-radius:5px;background-color:#FFBA52;color:#222;font-weight:normal;',
      critical: 'padding:2px 4px;border-radius:5px;background-color:#AD0000;color:#fff;font-weight:normal;',
      serious: 'padding:2px 4px;border-radius:5px;background-color:#333;color:#FFCE85;font-weight:normal;',
      minor: 'padding:2px 4px;border-radius:5px;background-color:#333;color:#FFCE85;font-weight:normal;',
      title: 'font-color:black;font-weight:bold;',
      url: 'font-color:#4D4D4D;font-weight:normal;'
    }
  }

  options = merge(defaultOptions, options)

  // Configure the format data
  axeCore.configure({ ...options.config })

  // Rechecking when updating specific component
  Vue.mixin({
    updated () {
      this.debounceAxe()
    },
    beforeDestroy () {
      this.clearAxeConsole(true)
    },
    methods: {
      clearAxeConsole (forceClear = false) {
        resetCache()

        if (forceClear || options.clearConsoleOnUpdate) {
          console.clear()
          resetLastNotification()
        }
      },
      axeRun ({ clearConsole = false, element = document } = {}) {
        this.clearAxeConsole(clearConsole)
        this.$nextTick(() => checkAndReport(options, element))
      },
      debounceAxe: debounce(function () {
        this.axeRun()
      }, 1000, { maxWait: 5000 })
    }
  })

  setTimeout(() => {
    return Vue.nextTick().then(() => checkAndReport(options, document))
  }, options.delay)
}
