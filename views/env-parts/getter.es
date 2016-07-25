import { observer, observe } from 'redux-observers'
import { createSelector } from 'reselect'
import { map, get } from 'lodash'
import path from 'path-extra'

import { store } from 'views/createStore'

const {buildArray, config} = window
function object2Array(obj) {
  return buildArray(map(obj, (v, k) => [k, v]))
}
function object2ArraySelectorFactory(path) {
  const pathSelector = (state) => get(state, path)
  return createSelector(
    pathSelector,
    (obj) => object2Array(obj)
  )
}

// User config
const language = Object.clone(window.language)
delete window.language
Object.defineProperty(window, 'language', {get: () => {
  return config.get('poi.language', language)
}})
Object.defineProperty(window, 'layout', {get: () => {
  return config.get('poi.layout', 'horizontal')
}})
Object.defineProperty(window, 'doubleTabbed', {get: () => {
  return config.get('poi.tabarea.double', false)
}})
Object.defineProperty(window, 'webviewWidth', {get: () => {
  return config.get('poi.webview.width', -1)
}})
Object.defineProperty(window, 'zoomLevel', {get: () => {
  return config.get('poi.zoomLevel', 1)
}})
Object.defineProperty(window, 'useSVGIcon', {get: () => {
  return config.get('poi.useSVGIcon', false)
}})
Object.defineProperty(window, 'screenshotPath', {get: () => {
  return config.get('poi.screenshotPath', process.platform == 'darwin' ? path.join(path.homedir(), 'Pictures', 'Poi') : path.join(global.APPDATA_PATH, 'screenshots'))
}})
Object.defineProperty(window.notify, 'morale', {get: () => {
  return config.get('poi.notify.morale.value', 49)
}})
Object.defineProperty(window.notify, 'expedition', {get: () => {
  return config.get('poi.notify.expedition.value', 60)
}})

// Game data
Object.defineProperty(window, '$slotitems', {get: () => {
  return window.getStore('const.$equips') || {}
}})
Object.defineProperty(window, '$slotitemTypes', {get: () => {
  return window.getStore('const.$equipTypes') || {}
}})
const mapareasObject2ArraySelector = object2ArraySelectorFactory('const.$mapareas')
Object.defineProperty(window, '$mapareas', {get: () => {
  return mapareasObject2ArraySelector(window.getStore())
}})
Object.defineProperty(window, '$maps', {get: () => {
  return window.getStore('const.$maps') || {}
}})
const missionsObject2ArraySelector = object2ArraySelectorFactory('const.$missions')
Object.defineProperty(window, '$missions', {get: () => {
  return missionsObject2ArraySelector(window.getStore())
}})
Object.defineProperty(window, '$shipTypes', {get: () => {
  return window.getStore('const.$shipTypes') || {}
}})
Object.defineProperty(window, '$ships', {get: () => {
  return window.getStore('const.$ships') || {}
}})
Object.defineProperty(window, '$useitems', {get: () => {
  return window.getStore('const.$useitems') || {}
}})
Object.defineProperty(window, '_decks', {get: () => {
  return window.getStore('info.fleets') || []
}})
Object.defineProperty(window, '_nickName', {get: () => {
  return window.getStore('info.basic.api_nickname') || ''
}})
Object.defineProperty(window, '_nickNameId', {get: () => {
  return window.getStore('info.basic.api_nickname_id') || -1
}})
Object.defineProperty(window, '_teitokuId', {get: () => {
  return window.getStore('info.basic.api_member_id') || -1
}})
Object.defineProperty(window, '_teitokuExp', {get: () => {
  return window.getStore('info.basic.api_experience') || 0
}})
Object.defineProperty(window, '_teitokuLv', {get: () => {
  return window.getStore('info.basic.api_level') || 0
}})
Object.defineProperty(window, '_ndock', {get: () => {
  const ret = []
  for (let i = 0; i < 4; i++) {
    ret.push(window.getStore(`info.repairs.${i}.api_ship_id`))
  }
  return ret
}})

const initShips = (dispatch, current, previous) => {
  window._ships = new Proxy(window.getStore('info.ships'), {
    get: (target, property, receiver) => {
      const ship = target[property]
      if (ship === undefined) {
        return undefined
      }
      return new Proxy(ship, {
        get: (innerTarget, innerProperty, innerReceiver) => {
          return ship[innerProperty] || window.getStore(`const.$ships.${ship.api_ship_id}.${innerProperty}`)
        },
      })
    },
  })
}

const initEquips = (dispatch, current, previous) => {
  window._slotitems = new Proxy(window.getStore('info.equips'), {
    get: (target, property, receiver) => {
      const equip = target[property]
      if (equip === undefined) {
        return undefined
      }
      return new Proxy(equip, {
        get: (innerTarget, innerProperty, innerReceiver) => {
          return equip[innerProperty] || window.getStore(`const.$equips.${equip.api_slotitem_id}.${innerProperty}`)
        },
      })
    },
  })
}

initShips()
initEquips()

const shipsObserver = observer(
  (state) => state.info.ships,
  initShips
)

const slotitemsObserver = observer(
  (state) => state.info.equips,
  initEquips
)

observe(store, [shipsObserver, slotitemsObserver])