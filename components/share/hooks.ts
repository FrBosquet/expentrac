import { useStore } from '@store'
import { getShareUpdater, getShares, getSharesSetter } from '@store/share'

export const useShares = () => {
  const shares = useStore(getShares)
  const setShares = useStore(getSharesSetter)
  const updateShare = useStore(getShareUpdater)

  return {
    shares,
    setShares,
    updateShare
  }
}
