/**
 * @name v-pure-tooltip
 * @description A pure CSS tooltip directive for Vue.js 2.x (based on Balloon.css)
 * @author Tanase Butcaru <contact@butcaru.com>
 * @license MIT
 */
import 'balloon-css'

const POSITION_MODIFIER = [
  'up',
  'down',
  'left',
  'right',
  'up-left',
  'up-right',
  'down-left',
  'down-right',
]
const LENGTH_MODIFIER = ['small', 'medium', 'large', 'xlarge', 'fit']
const VISIBLE_MODIFIER = 'visible'

const DATA_ATTR_VALUE = 'aria-label'
const DATA_ATTR_POSITION = 'data-balloon-pos'
const DATA_ATTR_LENGTH = 'data-balloon-length'
const DATA_ATTR_VISIBLE = 'data-balloon-visible'

const defaultBallonData = {
  [DATA_ATTR_POSITION]: POSITION_MODIFIER[0],
  [DATA_ATTR_LENGTH]: LENGTH_MODIFIER[4],
}

/**
 * Extract balloon position, length and visible data
 * added via modifiers.
 * @param {Object} modifiers
 * @example
 * `<div v-pure-tooltip.down.medium.visible="someTooltipMessage"></div>`
 * @returns {Object} balloon input data
 */
const extractDataFromModifiers = modifiers => {
  const modifiersList = Object.keys(modifiers)

  const result = {
    ...defaultBallonData,
  }

  modifiersList.forEach(modifier => {
    if (POSITION_MODIFIER.includes(modifier)) {
      result[DATA_ATTR_POSITION] = modifier
    } else if (LENGTH_MODIFIER.includes(modifier)) {
      result[DATA_ATTR_LENGTH] = modifier
    } else if (VISIBLE_MODIFIER === modifier) {
      result[DATA_ATTR_VISIBLE] = ''
    }
  })

  return result
}

/**
 * Extract balloon position, length, visible and value data
 * added via directive object literal value.
 * @param {Object} objectLiteral
 * @example
 * `<div v-pure-tooltip="{
 *    position: 'down',
 *    length: 'medium',
 *    visible: true,
 *    value: 'some tooltip message'}"
 * ></div>`
 * @returns {Object} balloon input data
 */
const extractDataFromObjectLiteral = objectLiteral => {
  const VALUE_KEY = 'value'
  const POSITION_KEY = 'position'
  const LENGTH_KEY = 'length'
  const VISIBLE_KEY = 'visible'

  const result = {
    ...defaultBallonData,
  }

  Object.keys(objectLiteral).forEach(key => {
    const value = objectLiteral[key]

    if (key === VALUE_KEY) {
      result[DATA_ATTR_VALUE] = value
    } else if (key === POSITION_KEY) {
      result[DATA_ATTR_POSITION] = value
    } else if (key === LENGTH_KEY) {
      result[DATA_ATTR_LENGTH] = value
    } else if (key === VISIBLE_KEY && value) {
      result[DATA_ATTR_VISIBLE] = ''
    }
  })

  return result
}

export default {
  install(Vue) {
    Vue.directive('pure-tooltip', (el, binding) => {
      let data

      if (typeof binding.value === 'object') {
        data = extractDataFromObjectLiteral(binding.value)
      } else if (typeof binding.value === 'string') {
        data = extractDataFromModifiers(binding.modifiers)

        if (binding.value.length) {
          data[DATA_ATTR_VALUE] = binding.value
        } else {
          return
        }
      } else {
        // throw new Error('[v-pure-tooltip] Unrecognized input data')
        return
      }

      if (binding.oldValue) {
        const hasVisible = el.getAttribute(DATA_ATTR_VISIBLE) !== null
        const currentValue = !!data[DATA_ATTR_VISIBLE]

        if (hasVisible !== currentValue) {
          el.removeAttribute(DATA_ATTR_VISIBLE)
        }
      }

      Object.keys(data).forEach(ballonKey => {
        el.setAttribute(ballonKey, data[ballonKey])
      })
    })
  },
}
