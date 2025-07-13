import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { computeRealizedPriceImpact, getPriceImpactWarning } from 'utils/prices'

import { useUSDCValue } from './useUSDCPrice'

export interface PriceImpact {
  percent: Percent
  warning?: 'warning' | 'error'
}

export function usePriceImpact(trade?: InterfaceTrade): PriceImpact | undefined {
  return useMemo(() => {
    try {
      const marketPriceImpact = trade ? computeRealizedPriceImpact(trade) : undefined
      
      // Add defensive check for invalid price impact
      if (marketPriceImpact && (marketPriceImpact.isNaN() || !isFinite(marketPriceImpact.toFixed(2)))) {
        return {
          percent: marketPriceImpact,
          warning: 'error',
        }
      }
      
      return marketPriceImpact
        ? {
            percent: marketPriceImpact,
            warning: getPriceImpactWarning(marketPriceImpact),
          }
        : undefined
    } catch (error) {
      // Handle any errors in price impact calculation
      console.warn('Error calculating price impact:', error)
      return {
        percent: new Percent(0, 100), // Default to 0%
        warning: 'error',
      }
    }
  }, [trade])
}

export function useFiatValueChange(trade?: InterfaceTrade) {
  const [inputUSDCValue, outputUSDCValue] = [useUSDCValue(trade?.inputAmount), useUSDCValue(trade?.outputAmount)]
  return useMemo(() => {
    const fiatPriceImpact = computeFiatValuePriceImpact(inputUSDCValue, outputUSDCValue)
    if (!fiatPriceImpact) {
      return undefined
    }
    return {
      percent: fiatPriceImpact,
      warning: getPriceImpactWarning(fiatPriceImpact),
    }
  }, [inputUSDCValue, outputUSDCValue])
}
