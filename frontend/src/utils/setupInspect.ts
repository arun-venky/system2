// Import XState inspector
export const setupInspect = async () => {
  try {
    const inspect = (await import('@xstate/inspect')).inspect
    
    // Create inspector
    inspect({
      iframe: false,
    })
    
    console.log('XState Visualizer initialized')
  } catch (error) {
    console.error('Failed to initialize XState Visualizer:', error)
  }
}